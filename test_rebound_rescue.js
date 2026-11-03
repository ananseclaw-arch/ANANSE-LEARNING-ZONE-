"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ReboundRescue = require("./rebound-rescue.js");

function finishRound(strategy) {
  const engine = ReboundRescue.createEngine({ seed: 7, totalRounds: 5 });
  let result = null;
  for (let step = 0; step < 20000 && !result; step += 1) {
    const state = engine.snapshot();
    if (state.phase === "ball" && state.ball) strategy(engine, state);
    engine.update(1 / 120).forEach((event) => {
      if (event.type === "finish") result = event.result;
    });
  }
  assert.ok(result, "finite round should finish without wall-clock timers");
  return { result, state: engine.snapshot() };
}

test("a perfect five-rebound round preserves Sharpshooter thresholds", () => {
  const run = finishRound((engine, state) => engine.moveTo(state.ball.x));
  assert.deepEqual(run.result, {
    reason: "complete", boards: 5, attempts: 5, total: 5,
    score: 10, xp: 15, perfect: true
  });
  assert.equal(run.state.done, true);
});

test("misses still produce a meaningful finite round with no reward", () => {
  const run = finishRound((engine, state) => engine.moveTo(state.ball.x < 450 ? 830 : 70));
  assert.equal(run.result.attempts, 5);
  assert.equal(run.result.boards, 0);
  assert.equal(run.result.score, 0);
  assert.equal(run.result.xp, 0);
  assert.equal(run.result.perfect, false);
});

test("explicit exit returns a stable partial result and cannot create perfection", () => {
  const engine = ReboundRescue.createEngine({ seed: 11, totalRounds: 5 });
  let caught = false;
  for (let step = 0; step < 5000 && !caught; step += 1) {
    const state = engine.snapshot();
    if (state.ball) engine.moveTo(state.ball.x);
    caught = engine.update(1 / 120).some((event) => event.type === "catch");
  }
  assert.equal(caught, true);
  const result = engine.end("exit");
  assert.deepEqual(result, {
    reason: "exit", boards: 1, attempts: 0, total: 5,
    score: 2, xp: 3, perfect: false
  });
  assert.equal(engine.snapshot().done, true);
});

test("lesson completion gate and legacy trophy identity remain wired", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  assert.match(html, /lessonPassed&&S\.results\.length>=S\.total[\s\S]{0,220}startHoops\(\)/);
  assert.match(html, /type:"hoops",icon:"🏀",label:"Sharpshooter"/);
  assert.match(html, /P\.xp\+=xp/);
  assert.doesNotMatch(html, /function hoopsShoot\(/);
});

test("guest preview is isolated and uses the shared implementation", () => {
  const html = fs.readFileSync(path.join(__dirname, "rebound-rescue-guest.html"), "utf8");
  const implementation = fs.readFileSync(path.join(__dirname, "rebound-rescue.js"), "utf8");
  assert.match(html, /<script src="rebound-rescue\.js"><\/script>/);
  assert.match(html, /let P=null;/);
  assert.match(html, /seed:20261103/);
  assert.match(html, /function fakeRewardCallback/);
  assert.doesNotMatch(html, /localStorage|sessionStorage|serviceWorker|\bfetch\s*\(|XMLHttpRequest|WebSocket/);
  assert.doesNotMatch(implementation, /localStorage|sessionStorage|serviceWorker|\bfetch\s*\(|XMLHttpRequest|WebSocket|speechSynthesis|AudioContext|\bsay\s*\(|\bsfx\s*\(/);
});

test("touch maps to the drawn court when the canvas is letterboxed (iPad landscape)", () => {
  // Measured in the preview at 1180x820: box 912x459, court drawn 738 wide, 87px bars each side.
  const rect = { left: 100, width: 912, height: 459.1875 };
  const drawn = 900 * (459.1875 / 560);
  const leftEdge = 100 + (912 - drawn) / 2;
  assert.ok(Math.abs(ReboundRescue.pointerToCourtX(leftEdge, rect) - 0) < 0.5);
  assert.ok(Math.abs(ReboundRescue.pointerToCourtX(leftEdge + drawn, rect) - 900) < 0.5);
  assert.ok(Math.abs(ReboundRescue.pointerToCourtX(100 + 456, rect) - 450) < 0.5);
  // Not letterboxed (portrait): plain proportional mapping still holds.
  const full = { left: 16, width: 788, height: 490.296875 };
  assert.ok(Math.abs(ReboundRescue.pointerToCourtX(16 + 788, full) - 900) < 0.5);
});


test("each actual launch has the exact increasing velocity for all RNG extremes", () => {
  for (const rng of [() => 0, () => 0.999999, ReboundRescue.seededRandom(37)]) {
    const engine = ReboundRescue.createEngine({rng});
    const launches = [];
    let previous = -1;
    for (let i = 0; i < 20000 && !engine.snapshot().done; i++) {
      const state = engine.snapshot();
      if (state.phase === "ball" && state.attempts !== previous) {
        previous = state.attempts;
        launches.push([Math.abs(state.ball.vx), state.ball.vy, Math.hypot(state.ball.vx,state.ball.vy)]);
      }
      if (state.phase === "ball") engine.moveTo(state.ball.x < 450 ? 830 : 70);
      engine.update(1/120);
    }
    assert.deepEqual(launches.map(v=>v.slice(0,2)), [[240,30],[285,50],[330,70],[375,90],[420,110]]);
    assert.ok(launches.every((v,i)=>i===0 || v[2] > launches[i-1][2]));
  }
});
