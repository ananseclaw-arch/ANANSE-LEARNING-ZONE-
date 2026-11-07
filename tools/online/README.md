# Race a friend: backend
Firebase project `grand-fable-gp-race` (Spark, free), owner earthur123@gmail.com. Realtime Database (us-central1) + Anonymous Auth.
Completely separate from every other project.

- `make_rules.py` writes `database.rules.json` (car and track ids come from `race3d.js`). **Run it and redeploy after adding a car or track**, or that car can't join a room:
  `python3 make_rules.py && firebase deploy --only database --project grand-fable-gp-race`
- `sweep.py` clears rooms left over from crashed sessions (see its header). Spark has no server code, so it runs from a logged-in machine.
- Client code: the `RACE A FRIEND` block at the end of `race3d.js`; SDK in `assets/vendor/firebase/` (firebase 10.14.1 compat), loaded only when someone taps Race a friend.
- Free limits: 100 connections at once, 1 GB stored, 10 GB/month downloaded. A 4-player, 3-minute race is about 3 MB in total.
