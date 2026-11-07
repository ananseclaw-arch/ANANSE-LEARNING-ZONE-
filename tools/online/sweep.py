#!/usr/bin/env python3
"""Removes rooms left idle for 30+ minutes from the Grand Fable GP race database.
Normal play cleans up after itself (the last player out deletes the room), and the rules already make an idle room unreadable
and unjoinable the moment 30 minutes pass. This only clears leftovers from crashed or closed sessions, whose row holds nothing
but car ids and random ids. Spark has no server code, so run it on a schedule from a machine logged in to Firebase. Safe to run any time.
   sweep.py                  # live project
   sweep.py --emulator       # local emulator on 127.0.0.1:9472
"""
import json, os, subprocess, sys, time
PROJECT = "grand-fable-gp-race"; IDLE_MS = 30 * 60 * 1000
here = os.path.dirname(os.path.abspath(__file__)); env = dict(os.environ)
if "--emulator" in sys.argv: env["FIREBASE_DATABASE_EMULATOR_HOST"] = "127.0.0.1:9472"
def fb(*a):
    r = subprocess.run(["firebase", *a, "--project", PROJECT, "--non-interactive"], capture_output=True, text=True, env=env, cwd=here)
    if r.returncode: sys.exit("firebase failed: " + r.stdout + r.stderr)
    return r.stdout
EMU = "--emulator" in sys.argv
def emu(method, path, q=""):  # the CLI's reads miss the emulator's namespace, so use its REST API directly
    import urllib.request
    rq = urllib.request.Request(f"http://127.0.0.1:9472{path}.json?ns={PROJECT}-default-rtdb{q}", method=method, headers={"Authorization": "Bearer owner"})
    return json.load(urllib.request.urlopen(rq))
def get(path, *extra):
    if EMU: return emu("GET", path, "&shallow=true" if extra else "")
    return json.loads(fb("database:get", path, *extra))
def remove(path):
    if EMU: emu("DELETE", path)
    else: fb("database:remove", path, "--force")
rooms = get("/rooms", "--shallow") or {}; now = time.time() * 1000; gone = 0
for code in rooms:
    t = get(f"/rooms/{code}/meta/touched")
    if not isinstance(t, (int, float)) or now - t > IDLE_MS:
        remove(f"/rooms/{code}"); gone += 1
print(f"rooms {len(rooms)}, removed {gone}")
