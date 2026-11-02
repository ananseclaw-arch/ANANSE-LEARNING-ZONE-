#!/usr/bin/env python3
"""Copy the approved staging video manifest into the app before testing/building."""
import json
import re
from pathlib import Path

manifest = Path.home() / 'staging/lz-notes/videos/LESSON_VIDEOS.json'
app = Path(__file__).resolve().parent / 'index.html'
data = json.loads(manifest.read_text(encoding='utf-8'))
if not isinstance(data, dict):
    raise ValueError('Video manifest must be an object')
for lesson, videos in data.items():
    if not re.fullmatch(r'\d+-\d+', lesson) or not isinstance(videos, list) or len(videos) > 5:
        raise ValueError(f'Invalid lesson or video list: {lesson!r}')
    if any(not isinstance(video, str) or not re.fullmatch(r'[A-Za-z0-9_-]{11}', video) for video in videos):
        raise ValueError(f'Invalid YouTube video ID in {lesson}')
source = app.read_text(encoding='utf-8')
replacement = 'const LESSON_VIDEOS=' + json.dumps(data, separators=(',', ':'), ensure_ascii=True) + ';'
updated, count = re.subn(r'^const LESSON_VIDEOS=\{[^\n]*\};$', lambda _: replacement, source, flags=re.M)
if count != 1:
    raise ValueError(f'Expected one LESSON_VIDEOS declaration, found {count}')
if updated != source:
    app.write_text(updated, encoding='utf-8')
print(f'Video manifest synced: {len(data)} lessons, {sum(map(len, data.values()))} videos')
