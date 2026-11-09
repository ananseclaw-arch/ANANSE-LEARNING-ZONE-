#!/usr/bin/env python3
"""Writes database.rules.json. Car and track ids come from race3d.js, so a player's car field can only ever hold a real car id
(no free text can travel through the database). Run after adding a car or track."""
import json, os, re
here = os.path.dirname(os.path.abspath(__file__)); src = open(os.path.join(here, "..", "..", "race3d.js"), encoding="utf-8").read()
cars = re.findall(r'\{id:"([a-z0-9_]+)"', src[src.index("const GP_CARS=["):src.index("const GP_SHAPE=")])
tracks = re.findall(r'\{id:"([a-z0-9_]+)"', src[src.index("const GP_CIRCUITS=["):src.index("function gpTrackPts")])
assert len(cars) >= 18 and len(tracks) >= 5 and "deep" in tracks, (cars, tracks)
# racing names (job 1107-0258): the very same pattern, length and rude-word lists the game checks (GPN_RUDE_SUB / GPN_RUDE_EX in race3d.js);
# a letter repeated ("Fuuck") still matches, whole-word list for the short words (so Hassan and Cassandra are fine)
sub = re.search(r'const GPN_RUDE_SUB="([a-z|]+)"', src).group(1).split("|"); ex = re.search(r'const GPN_RUDE_EX="([a-z|]+)"', src).group(1).split("|")
rep_ = lambda w: "".join(c + "+" for c in w)
RUDE_SUB = "(" + "|".join(rep_(w) for w in sub) + ")"; RUDE_EX = "(" + "|".join(rep_(w) for w in ex) + ")"
NAME_OK = ("newData.isString() && newData.val().matches(/^[A-Z][a-z]{1,9}$/) && !newData.val().toLowerCase().matches(/^.*" + RUDE_SUB + ".*$/) && !newData.val().toLowerCase().matches(/^" + RUDE_EX + "$/)")
CODE = "BDFGHJKLMNRSTWXY"  # kept in step with GPN_ALPHA in race3d.js
IDLE = 1800000
ROOM = "root.child('rooms').child($code)"
FRESH = f"{ROOM}.child('meta/touched').val() > now - {IDLE}"
MEMBER = f"{ROOM}.child('players').child(auth.uid).exists()"
HOST = f"{ROOM}.child('meta/host').val() === auth.uid"
SEEN = f"auth != null && {MEMBER} && {FRESH}"
def num(lo, hi): return {".validate": f"newData.isNumber() && newData.val() >= {lo} && newData.val() <= {hi}"}
NO = {".validate": False}
rules = {"rules": {
  ".read": False, ".write": False,
  "rooms": {
    ".read": False,  # nobody can list rooms
    "$code": {
      # a whole room can only be removed: by its host, or by anyone once it has sat idle for 30 minutes
      ".write": f"auth != null && !newData.exists() && data.exists() && (data.child('meta/host').val() === auth.uid || data.child('meta/touched').val() < now - {IDLE})",
      ".validate": f"$code.matches(/^[{CODE}]{{5}}$/)",
      "meta": {
        ".read": f"auth != null && data.child('touched').val() > now - {IDLE}",
        ".write": f"auth != null && newData.exists() && ((!data.exists() && newData.child('host').val() === auth.uid) || (data.child('host').val() === auth.uid && data.child('touched').val() > now - {IDLE}))",
        ".validate": "newData.hasChildren(['host','track','laps','pace','state','run','touched'])",
        "host": {
          # the host dropped out: another player in the room may take over (and only give it to themselves)
          # (their row is gone, or they dropped over 10 s ago, or a race has sat still for 2 minutes because their tab stopped)
          ".write": f"{SEEN} && newData.val() === auth.uid && (!{ROOM}.child('players').child(data.val()).exists() || ({ROOM}.child('players').child(data.val()).child('on').val() === false && {ROOM}.child('players').child(data.val()).child('offAt').val() < now - 10000) || ({ROOM}.child('meta/state').val() !== 'lobby' && {ROOM}.child('meta/state').val() !== 'done' && {ROOM}.child('meta/touched').val() < now - 120000))",
          ".validate": f"newData.isString() && newData.val().matches(/^[A-Za-z0-9]{{1,64}}$/) && (newData.val() === auth.uid || {ROOM}.child('players').child(newData.val()).exists())"},
        "locked": {".validate": "newData.isBoolean()"},
        "look": {".validate": "newData.isString() && newData.val().matches(/^(real|story)$/)"},   # the host's Look (Realistic / Storybook): everyone in the room races with it
        "track": {".validate": "newData.isString() && newData.val().matches(/^(" + "|".join(tracks) + ")$/)"},
        "laps": {".validate": "newData.isNumber() && (newData.val() === 1 || newData.val() === 2 || newData.val() === 3)"},
        "pace": {".validate": "newData.isString() && newData.val().matches(/^(gentle|normal)$/)"},
        "state": {".validate": "newData.isString() && newData.val().matches(/^(lobby|load|count|race|done)$/)"},
        "run": num(0, 9999),
        "n": num(0, 3),            # races finished in this series (points carry over for 3 races)
        "scored": num(0, 9999),    # the last run whose points were counted (so a host change never counts a race twice)
        "goAt": {".validate": "newData.isNumber() && newData.val() > now - 60000 && newData.val() < now + 60000"},
        # keeps the room alive while it is really being used; only ever the server's clock
        "touched": {".write": SEEN, ".validate": "newData.val() === now || newData.val() === data.val()"},
        "$other": NO},
      "slots": {
        # four numbered seats, one claim each: this is what caps a room at 4 players
        ".read": SEEN,
        "$n": {
          ".write": f"auth != null && {FRESH} && ((!data.exists() && newData.val() === auth.uid && {ROOM}.child('meta/state').val() === 'lobby' && {ROOM}.child('meta/locked').val() !== true && !{ROOM}.child('kick').child(auth.uid).exists() && {ROOM}.child('slots/0').val() !== auth.uid && {ROOM}.child('slots/1').val() !== auth.uid && {ROOM}.child('slots/2').val() !== auth.uid && {ROOM}.child('slots/3').val() !== auth.uid) || (data.val() === auth.uid && !newData.exists()) || ({HOST} && !newData.exists()))",
          ".validate": "$n.matches(/^[0-3]$/) && newData.isString() && newData.val().length <= 64"}},
      "players": {
        ".read": SEEN,
        "$uid": {
          ".write": f"auth != null && {FRESH} && ((auth.uid === $uid && (!newData.exists() || ({ROOM}.child('slots').child(newData.child('slot').val() + '').val() === auth.uid && !{ROOM}.child('kick').child(auth.uid).exists()))) || ({HOST} && !newData.exists()))",
          ".validate": "newData.hasChildren(['car','paint','slot','on','ready','load'])",
          "car": {".validate": "newData.isString() && newData.val().matches(/^(" + "|".join(cars) + ")$/)"},
          "paint": {".validate": "newData.isString() && newData.val().matches(/^#[0-9a-f]{6}$/)"},
          "name": {".validate": NAME_OK},   # optional: 2-10 letters, Title Case, no rude words; without it the car+colour label is shown
          "slot": num(0, 3),
          "on": {".validate": "newData.isBoolean()"},
          "ready": num(-1, 9999),  # the run this player is ready for: a new race never starts on an old "ready"
          "load": num(-1, 9999),
          "offAt": {".validate": "newData.val() === now || newData.val() === data.val()"},  # server clock only
          "$other": NO}},
      "cars": {
        ".read": SEEN,
        ".write": f"auth != null && {HOST} && !newData.exists()",  # the host clears the track for the next race
        "$uid": {
          # your own car only, and only numbers
          ".write": f"auth != null && {FRESH} && ((auth.uid === $uid && {MEMBER}) || ({HOST} && !newData.exists()))",
          ".validate": "newData.hasChildren(['t','l','x','y','a','v','f','n'])",
          "t": num(0, 1), "l": num(-1, 9), "x": num(-99, 99), "y": num(-1000, 3000), "a": num(-7, 7), "v": num(-200, 400),
          "f": num(0, 1023), "n": num(0, 1e9), "$other": NO}},
      "bump": {
        # a knock between two cars: my device tells the other car's device (numbers and a player id only)
        ".read": SEEN,
        ".write": f"auth != null && {HOST} && !newData.exists()",
        "$uid": {
          ".write": f"auth != null && {FRESH} && ((auth.uid === $uid && {MEMBER}) || ({HOST} && !newData.exists()))",
          ".validate": "newData.hasChildren(['to','s','i','n'])",
          "to": {".validate": f"newData.isString() && newData.val().matches(/^[A-Za-z0-9]{{1,64}}$/) && {ROOM}.child('players').child(newData.val()).exists()"},
          "s": {".validate": "newData.isNumber() && (newData.val() === 1 || newData.val() === -1)"},
          "i": num(0, 9), "n": num(0, 9e13), "$other": NO}},
      "finish": {
        ".read": SEEN,
        ".write": f"auth != null && {HOST} && !newData.exists()",
        "$uid": {
          ".write": f"auth != null && {FRESH} && ((auth.uid === $uid && {MEMBER}) || ({HOST} && !newData.exists()))",
          ".validate": f"newData.hasChildren(['ms','run']) && newData.child('run').val() === {ROOM}.child('meta/run').val() && ({ROOM}.child('meta/state').val() === 'race' || {ROOM}.child('meta/state').val() === 'count')",
          "ms": num(5000, 7200000), "run": num(0, 9999), "$other": NO}},
      "order": {
        ".read": SEEN,
        # the host alone writes the agreed finish order
        ".write": f"auth != null && {FRESH} && {HOST}",
        ".validate": "newData.hasChildren(['run','final'])",
        "run": num(0, 9999), "final": {".validate": "newData.isBoolean()"},
        "list": {".validate": "newData.hasChildren()", "$i": {".validate": "$i.matches(/^[0-3]$/) && newData.isString() && newData.val().matches(/^[A-Za-z0-9]{1,64}$/)"}},
        "$other": NO},
      "series": {
        # series points: only the host writes them (a kid's own device can't award itself points)
        ".read": SEEN,
        ".write": f"auth != null && {FRESH} && {HOST}",
        "$uid": {".validate": "$uid.matches(/^[A-Za-z0-9]{1,64}$/) && newData.isNumber() && newData.val() >= 0 && newData.val() <= 40", "$other": NO}},
      "kick": {
        # the host can remove a player from the lobby; that player cannot come back into this room
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": f"auth != null && {FRESH} && {HOST} && $uid !== auth.uid",
          ".validate": "newData.isBoolean()"}},
      "$other": NO}}}}
open(os.path.join(here, "database.rules.json"), "w").write(json.dumps(rules, indent=1) + "\n")
print("rules:", len(cars), "cars,", len(tracks), "tracks, alphabet", CODE)
