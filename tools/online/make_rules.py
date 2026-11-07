#!/usr/bin/env python3
"""Writes database.rules.json. Car and track ids come from race3d.js, so a player's car field can only ever hold a real car id
(no free text can travel through the database). Run after adding a car or track."""
import json, os, re
here = os.path.dirname(os.path.abspath(__file__)); src = open(os.path.join(here, "..", "..", "race3d.js"), encoding="utf-8").read()
cars = re.findall(r'\{id:"([a-z0-9_]+)"', src[src.index("const GP_CARS=["):src.index("const GP_SHAPE=")])
tracks = re.findall(r'\{id:"([a-z0-9_]+)"', src[src.index("const GP_CIRCUITS=["):src.index("function gpTrackPts")])
assert len(cars) >= 18 and len(tracks) >= 5 and "deep" in tracks, (cars, tracks)
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
        ".write": "auth != null && newData.exists() && ((!data.exists() && newData.child('host').val() === auth.uid) || data.child('host').val() === auth.uid)",
        ".validate": "newData.hasChildren(['host','track','laps','pace','state','run','touched'])",
        "host": {
          # the host dropped out: another player in the room may take over (and only give it to themselves)
          ".write": f"{SEEN} && newData.val() === auth.uid && {ROOM}.child('players').child(data.val()).child('on').val() !== true",
          ".validate": "newData.isString() && newData.val().length <= 64"},
        "track": {".validate": "newData.isString() && newData.val().matches(/^(" + "|".join(tracks) + ")$/)"},
        "laps": {".validate": "newData.isNumber() && (newData.val() === 1 || newData.val() === 2 || newData.val() === 3)"},
        "pace": {".validate": "newData.isString() && newData.val().matches(/^(gentle|normal)$/)"},
        "state": {".validate": "newData.isString() && newData.val().matches(/^(lobby|load|count|race|done)$/)"},
        "run": num(0, 9999),
        "goAt": {".validate": "newData.isNumber() && newData.val() > now - 60000 && newData.val() < now + 60000"},
        # keeps the room alive while it is really being used; only ever the server's clock
        "touched": {".write": SEEN, ".validate": "newData.val() === now || newData.val() === data.val()"},
        "$other": NO},
      "slots": {
        # four numbered seats, one claim each: this is what caps a room at 4 players
        ".read": SEEN,
        "$n": {
          ".write": f"auth != null && {FRESH} && ((!data.exists() && newData.val() === auth.uid && {ROOM}.child('meta/state').val() === 'lobby' && !{ROOM}.child('kick').child(auth.uid).exists()) || (data.val() === auth.uid && !newData.exists()) || ({HOST} && !newData.exists()))",
          ".validate": "$n.matches(/^[0-3]$/) && newData.isString() && newData.val().length <= 64"}},
      "players": {
        ".read": SEEN,
        "$uid": {
          ".write": f"auth != null && {FRESH} && ((auth.uid === $uid && (!newData.exists() || {ROOM}.child('slots').child(newData.child('slot').val() + '').val() === auth.uid)) || ({HOST} && !newData.exists()))",
          ".validate": "newData.hasChildren(['car','paint','slot','on','ready','load'])",
          "car": {".validate": "newData.isString() && newData.val().matches(/^(" + "|".join(cars) + ")$/)"},
          "paint": {".validate": "newData.isString() && newData.val().matches(/^#[0-9a-f]{6}$/)"},
          "slot": num(0, 3),
          "on": {".validate": "newData.isBoolean()"},
          "ready": num(-1, 9999),  # the run this player is ready for: a new race never starts on an old "ready"
          "load": num(-1, 9999),
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
      "finish": {
        ".read": SEEN,
        ".write": f"auth != null && {HOST} && !newData.exists()",
        "$uid": {
          ".write": f"auth != null && {FRESH} && ((auth.uid === $uid && {MEMBER}) || ({HOST} && !newData.exists()))",
          ".validate": "newData.hasChildren(['ms','run'])",
          "ms": num(0, 7200000), "run": num(0, 9999), "$other": NO}},
      "order": {
        ".read": SEEN,
        # the host alone writes the agreed finish order
        ".write": f"auth != null && {FRESH} && {HOST}",
        ".validate": "newData.hasChildren(['run','final'])",
        "run": num(0, 9999), "final": {".validate": "newData.isBoolean()"},
        "list": {"$i": {".validate": "$i.matches(/^[0-3]$/) && newData.isString() && newData.val().length <= 64"}},
        "$other": NO},
      "kick": {
        # the host can remove a player from the lobby; that player cannot come back into this room
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": f"auth != null && {FRESH} && {HOST} && $uid !== auth.uid",
          ".validate": "newData.isBoolean()"}},
      "$other": NO}}}}
open(os.path.join(here, "database.rules.json"), "w").write(json.dumps(rules, indent=1) + "\n")
print("rules:", len(cars), "cars,", len(tracks), "tracks, alphabet", CODE)
