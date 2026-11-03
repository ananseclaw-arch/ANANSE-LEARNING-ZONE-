(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ReboundRescue = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const WIDTH = 900;
  const HEIGHT = 560;
  const DEFAULT_ROUNDS = 5;
  const XP_PER_RESCUE = 3;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function seededRandom(seed) {
    let value = (Number(seed) || 1) >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeResult(state, reason) {
    const boards = state.boards;
    return Object.freeze({
      reason: reason || "complete",
      boards,
      attempts: state.attempts,
      total: state.totalRounds,
      score: boards * 2,
      xp: boards * XP_PER_RESCUE,
      perfect: state.attempts === state.totalRounds && boards === state.totalRounds
    });
  }

  // Map a screen x to court x. The canvas uses object-fit:contain on short landscape
  // screens (iPad landscape), so the court is letterboxed inside its box; map against
  // the drawn court, not the whole element, or the player lands off the finger.
  function pointerToCourtX(clientX, rect) {
    if (!rect || !rect.width || !rect.height) return WIDTH / 2;
    const scale = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    const left = rect.left + (rect.width - WIDTH * scale) / 2;
    return (clientX - left) / scale;
  }

  function createEngine(options) {
    const opts = options || {};
    const rng = typeof opts.rng === "function" ? opts.rng : seededRandom(opts.seed || 1);
    const totalRounds = Math.max(1, Math.floor(opts.totalRounds || DEFAULT_ROUNDS));
    const state = {
      totalRounds,
      attempts: 0,
      boards: 0,
      misses: 0,
      score: 0,
      playerX: 450,
      targetX: 450,
      phase: "ball",
      ball: null,
      putback: null,
      nextBallIn: 0,
      done: false
    };

    function random(min, max) {
      return min + rng() * (max - min);
    }

    function newBall() {
      const side = rng() < 0.5 ? -1 : 1;
      state.ball = {
        x: 450,
        y: 155,
        // Fixed magnitudes prevent random overlap: every successive launch is faster.
        vx: side * (240 + state.attempts * 45),
        vy: 30 + state.attempts * 20,
        rotation: 0,
        active: true
      };
      state.phase = "ball";
    }

    function finishAttempt(events) {
      state.attempts += 1;
      if (state.attempts >= state.totalRounds) {
        state.done = true;
        state.phase = "done";
        events.push({ type: "finish", result: makeResult(state, "complete") });
      } else {
        state.phase = "waiting";
        state.nextBallIn = 0.45;
      }
    }

    function moveTo(x) {
      if (!state.done) state.targetX = clamp(Number(x) || 0, 70, 830);
    }

    function update(seconds) {
      const events = [];
      if (state.done) return events;
      const dt = clamp(Number(seconds) || 0, 0, 0.04);
      state.playerX = lerp(state.playerX, state.targetX, clamp(dt * 11, 0, 1));

      if (state.phase === "putback") {
        state.putback.t += dt;
        if (!state.putback.scored && state.putback.t > 0.72) {
          state.putback.scored = true;
          state.score = state.boards * 2;
          events.push({ type: "score", points: 2 });
        }
        if (state.putback.t > 1.1) {
          state.putback = null;
          finishAttempt(events);
        }
        return events;
      }

      if (state.phase === "waiting") {
        state.nextBallIn -= dt;
        if (state.nextBallIn <= 0) newBall();
        return events;
      }

      const ball = state.ball;
      if (!ball || !ball.active) return events;
      ball.vy += 590 * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.rotation += ball.vx * dt * 0.01;
      if (ball.x < 35 || ball.x > 865) {
        ball.x = clamp(ball.x, 35, 865);
        ball.vx *= -0.76;
      }
      if (ball.y > 438 && Math.abs(ball.x - state.playerX) < 66) {
        ball.active = false;
        state.boards += 1;
        state.phase = "putback";
        state.putback = { t: 0, startX: state.playerX, scored: false };
        events.push({ type: "catch" });
      } else if (ball.y > 590) {
        ball.active = false;
        state.misses += 1;
        events.push({ type: "miss" });
        finishAttempt(events);
      }
      return events;
    }

    function end(reason) {
      if (!state.done) {
        state.done = true;
        state.phase = "done";
      }
      return makeResult(state, reason || "exit");
    }

    function snapshot() {
      return {
        totalRounds: state.totalRounds,
        attempts: state.attempts,
        boards: state.boards,
        misses: state.misses,
        score: state.score,
        playerX: state.playerX,
        targetX: state.targetX,
        phase: state.phase,
        ball: state.ball && Object.assign({}, state.ball),
        putback: state.putback && Object.assign({}, state.putback),
        nextBallIn: state.nextBallIn,
        done: state.done
      };
    }

    newBall();
    return { moveTo, update, end, snapshot };
  }

  const STYLES = `
    .rr-shell{--rr-ink:#14213d;--rr-gold:#ffca3a;--rr-blue:#2878ff;--rr-mint:#3ddc97;--rr-red:#e63946;max-width:920px;margin:0 auto;color:var(--rr-ink);font-family:-apple-system,"SF Pro Rounded","Avenir Next",system-ui,sans-serif;text-align:left}
    .rr-cabinet{overflow:hidden;border:4px solid #fff;border-radius:26px;background:#fffaf0;box-shadow:0 14px 40px rgba(20,33,61,.22),0 8px 0 rgba(20,33,61,.1)}
    .rr-bar{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;padding:12px 14px;border-bottom:3px solid var(--rr-ink);background:#fff}
    .rr-title{margin:0;color:var(--rr-ink);font-size:clamp(22px,4vw,32px);line-height:1.05}
    .rr-subtitle{margin:4px 0 0;color:#53607b;font-size:clamp(14px,2.2vw,17px);font-weight:700}
    .rr-scoreboard{display:flex;gap:8px}
    .rr-chip{min-width:78px;padding:6px 10px;border:2px solid var(--rr-ink);border-radius:14px;text-align:center;background:#e9f3ff;box-shadow:0 3px 0 rgba(20,33,61,.16)}
    .rr-chip small{display:block;font-size:10px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
    .rr-chip strong{display:block;font-size:24px;line-height:1.05;font-variant-numeric:tabular-nums}
    .rr-court-wrap{position:relative;overflow:hidden;background:#d68a3b;isolation:isolate}
    .rr-canvas{display:block;width:100%;height:auto;margin:0 auto;aspect-ratio:900/560;background:#dda15e;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
    .rr-canvas:active{cursor:grabbing}
    .rr-toast{position:absolute;top:16px;left:50%;z-index:2;min-width:9ch;padding:7px 15px;border:3px solid var(--rr-ink);border-radius:999px;color:var(--rr-ink);background:#fff;box-shadow:0 5px 0 rgba(20,33,61,.24);font-size:clamp(16px,3vw,21px);font-weight:950;text-align:center;transform:translate(-50%,-90px) rotate(-2deg);transition:transform .22s cubic-bezier(.2,.9,.3,1.3);pointer-events:none}
    .rr-toast.show{transform:translate(-50%,0) rotate(-2deg)}
    .rr-controls{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;min-height:78px;padding:12px 14px 14px;border-top:3px solid var(--rr-ink);background:#fff7e5}
    .rr-howto{display:flex;align-items:center;gap:10px;min-width:0}
    .rr-howto-icon{display:grid;flex:0 0 44px;width:44px;height:44px;place-items:center;border:2px solid var(--rr-ink);border-radius:50%;background:var(--rr-gold);font-size:24px}
    .rr-howto p{margin:0;font-size:clamp(15px,2.2vw,19px);font-weight:850;line-height:1.3}
    .rr-exit{min-height:48px;padding:8px 18px;border:3px solid var(--rr-ink);border-radius:14px;color:var(--rr-ink);background:#fff;box-shadow:0 4px 0 #c8cbd1;font-family:inherit;font-size:17px;font-weight:900;cursor:pointer;touch-action:manipulation}
    .rr-exit:active{transform:translateY(3px);box-shadow:0 1px 0 #c8cbd1}
    .rr-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:620px){.rr-cabinet{border-width:3px;border-radius:19px}.rr-bar{padding:9px 10px}.rr-chip{min-width:64px;padding:5px 7px}.rr-chip strong{font-size:20px}.rr-controls{grid-template-columns:1fr;padding:9px 10px 12px}.rr-exit{width:100%}}
    @media(min-width:700px) and (max-height:900px){.rr-canvas{max-height:56vh;object-fit:contain}.rr-controls{min-height:64px;padding:8px 14px 10px}}
    @media(prefers-reduced-motion:reduce){.rr-toast{transition-duration:.01ms}}
  `;

  function markup() {
    return `<div class="rr-shell">
      <style>${STYLES}</style>
      <section class="rr-cabinet" aria-labelledby="rr-title">
        <div class="rr-bar">
          <div><h1 class="rr-title" id="rr-title">🏀 Rebound Rescue</h1><p class="rr-subtitle">Rescue five loose rebounds and put them back.</p></div>
          <div class="rr-scoreboard" aria-label="Scoreboard">
            <div class="rr-chip"><small>Score</small><strong data-rr-score>0</strong></div>
            <div class="rr-chip"><small>Round</small><strong data-rr-round>1 / 5</strong></div>
          </div>
        </div>
        <div class="rr-court-wrap">
          <canvas class="rr-canvas" data-rr-canvas width="900" height="560" tabindex="0" aria-label="Rebound Rescue basketball court. Drag left and right to get under the loose ball."></canvas>
          <div class="rr-toast" data-rr-toast aria-hidden="true"></div>
        </div>
        <div class="rr-controls">
          <div class="rr-howto"><span class="rr-howto-icon" aria-hidden="true">🙌</span><p>Touch and drag anywhere on the court to move under the ball. Each rescue launches a 2-point putback.</p></div>
          <button class="rr-exit" type="button" data-rr-exit>Exit game</button>
        </div>
        <p class="rr-sr" role="status" aria-live="polite" data-rr-status></p>
      </section>
    </div>`;
  }

  function mount(rootElement, options) {
    if (!rootElement || typeof rootElement.querySelector !== "function") throw new Error("Rebound Rescue needs a root element.");
    const opts = options || {};
    const engine = createEngine({ seed: opts.seed || 1, rng: opts.rng, totalRounds: opts.totalRounds || DEFAULT_ROUNDS });
    rootElement.innerHTML = markup();
    const canvas = rootElement.querySelector("[data-rr-canvas]");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Rebound Rescue needs canvas support.");
    const scoreElement = rootElement.querySelector("[data-rr-score]");
    const roundElement = rootElement.querySelector("[data-rr-round]");
    const toastElement = rootElement.querySelector("[data-rr-toast]");
    const statusElement = rootElement.querySelector("[data-rr-status]");
    const exitButton = rootElement.querySelector("[data-rr-exit]");
    const dpr = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0;
    let lastTime = null;
    let destroyed = false;
    let finished = false;
    let dragging = false;
    let toastTimer = 0;
    let particles = [];
    let displayTime = 0;

    function random(min, max) {
      const value = (Math.sin((displayTime + particles.length + 1) * 999) + 1) / 2;
      return min + value * (max - min);
    }

    function roundedRect(x, y, width, height, radius, fill, stroke, lineWidth) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, width, height, r);
      else {
        ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r); ctx.closePath();
      }
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 2; ctx.stroke(); }
    }

    function drawBall(x, y, radius, rotation) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rotation || 0);
      ctx.shadowColor = "rgba(62,27,5,.25)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#f47721"; ctx.strokeStyle = "#512a15"; ctx.lineWidth = Math.max(2, radius * 0.11);
      ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.shadowColor = "transparent"; ctx.beginPath(); ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0);
      ctx.moveTo(0, -radius); ctx.bezierCurveTo(radius * 0.45, -radius * 0.45, radius * 0.45, radius * 0.45, 0, radius);
      ctx.moveTo(0, -radius); ctx.bezierCurveTo(-radius * 0.45, -radius * 0.45, -radius * 0.45, radius * 0.45, 0, radius);
      ctx.stroke(); ctx.restore();
    }

    function drawPlayer(x, y, pose) {
      ctx.save(); ctx.translate(x, y); ctx.scale(1.08, 1.08); ctx.lineCap = "round";
      ctx.strokeStyle = "#14213d"; ctx.lineWidth = 7; ctx.beginPath();
      if (pose === "reach") {
        ctx.moveTo(-5, -45); ctx.lineTo(-23, -76); ctx.moveTo(5, -45); ctx.lineTo(24, -78);
      } else {
        ctx.moveTo(-5, -43); ctx.lineTo(-24, -24); ctx.moveTo(5, -43); ctx.lineTo(24, -29);
      }
      ctx.moveTo(-7, -8); ctx.lineTo(-17, 23); ctx.moveTo(7, -8); ctx.lineTo(17, 23); ctx.stroke();
      roundedRect(-20, -58, 40, 53, 12, "#2878ff", "#14213d", 4);
      ctx.fillStyle = "#fff"; ctx.font = "900 21px system-ui"; ctx.textAlign = "center"; ctx.fillText("★", 0, -22);
      ctx.fillStyle = "#8c573a"; ctx.strokeStyle = "#14213d"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, -72, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#14213d"; ctx.beginPath(); ctx.arc(0, -78, 15, Math.PI, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    function drawHoop() {
      ctx.save(); ctx.translate(450, 90); ctx.scale(0.9, 0.9);
      roundedRect(-70, -60, 140, 85, 10, "rgba(225,242,255,.78)", "#f7fbff", 7);
      ctx.strokeStyle = "#e63946"; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 32, 59, 15, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3;
      for (let netX = -45; netX <= 45; netX += 18) { ctx.beginPath(); ctx.moveTo(netX, 39); ctx.lineTo(netX * 0.55, 80); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-55, 45); ctx.quadraticCurveTo(0, 68, 55, 45); ctx.moveTo(-40, 63); ctx.quadraticCurveTo(0, 81, 40, 63); ctx.stroke(); ctx.restore();
    }

    function drawCourt() {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT); gradient.addColorStop(0, "#f4b96b"); gradient.addColorStop(1, "#c97834");
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "rgba(94,46,15,.15)"; ctx.lineWidth = 2;
      for (let y = 25; y < HEIGHT; y += 43) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
      for (let x = 0; x < WIDTH; x += 110) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 30, HEIGHT); ctx.stroke(); }
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 5; ctx.strokeRect(24, 22, WIDTH - 48, HEIGHT - 44);
      ctx.beginPath(); ctx.arc(450, 185, 175, 0, Math.PI); ctx.stroke(); ctx.strokeRect(325, 22, 250, 210);
    }

    function burst(x, y) {
      for (let i = 0; i < 18; i += 1) {
        const angle = random(0, Math.PI * 2); const speed = random(70, 240);
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 70, life: random(0.45, 0.9), size: random(4, 10) });
      }
    }

    function drawParticles(dt) {
      particles = particles.filter(function (particle) {
        particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 420 * dt;
        if (particle.life <= 0) return false;
        ctx.globalAlpha = clamp(particle.life * 1.7, 0, 1); ctx.fillStyle = "#ffca3a"; ctx.fillRect(particle.x, particle.y, particle.size, particle.size); ctx.globalAlpha = 1;
        return true;
      });
    }

    function showToast(message, color) {
      toastElement.textContent = message; toastElement.style.background = color || "#fff"; toastElement.classList.add("show"); statusElement.textContent = message;
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastElement.classList.remove("show"); }, 950);
    }

    function updateHud(snapshot) {
      scoreElement.textContent = String(snapshot.score);
      const current = Math.min(snapshot.attempts + 1, snapshot.totalRounds);
      roundElement.textContent = current + " / " + snapshot.totalRounds;
    }

    function finish(reason, suppliedResult) {
      if (finished || destroyed) return;
      finished = true;
      const result = suppliedResult || engine.end(reason || "exit");
      destroy();
      if (typeof opts.onFinish === "function") opts.onFinish(result);
    }

    function handleEvents(events) {
      events.forEach(function (event) {
        if (event.type === "catch") showToast("Great board!", "#8df0c2");
        if (event.type === "score") { burst(450, 150); showToast("PUTBACK! +2", "#ffdf67"); }
        if (event.type === "miss") showToast("Chase the next one!");
        if (event.type === "finish") finish("complete", event.result);
      });
    }

    function draw(snapshot, dt) {
      drawCourt(); drawHoop();
      drawPlayer(snapshot.playerX, 482, snapshot.putback ? "reach" : "stand");
      if (snapshot.putback) {
        const t = clamp(snapshot.putback.t / 0.78, 0, 1); const inverse = 1 - t;
        const x = inverse * inverse * snapshot.putback.startX + 2 * inverse * t * 450 + t * t * 450;
        const y = inverse * inverse * 390 + 2 * inverse * t * 120 + t * t * 145;
        drawBall(x, y, 20, t * 8);
      } else if (snapshot.ball && snapshot.ball.active) {
        ctx.fillStyle = "rgba(20,33,61,.16)"; ctx.beginPath(); ctx.ellipse(snapshot.ball.x, 515, 25, 8, 0, 0, Math.PI * 2); ctx.fill();
        drawBall(snapshot.ball.x, snapshot.ball.y, 21, snapshot.ball.rotation);
      }
      roundedRect(42, 38, 295, 54, 17, "rgba(20,33,61,.82)");
      ctx.fillStyle = "#fff"; ctx.font = "800 21px system-ui"; ctx.textAlign = "left"; ctx.fillText("Move under the rebound!", 62, 72);
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.moveTo(snapshot.playerX - 42, 525); ctx.lineTo(snapshot.playerX + 42, 525); ctx.lineTo(snapshot.playerX, 540); ctx.closePath(); ctx.fill();
      drawParticles(dt);
    }

    function frame(now) {
      if (destroyed) return;
      const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now; displayTime += dt;
      const events = engine.update(dt); const snapshot = engine.snapshot(); updateHud(snapshot); draw(snapshot, dt); handleEvents(events);
      if (!destroyed) raf = window.requestAnimationFrame(frame);
    }

    function canvasX(event) {
      return pointerToCourtX(event.clientX, canvas.getBoundingClientRect());
    }

    function pointerDown(event) {
      event.preventDefault(); dragging = true; canvas.setPointerCapture && canvas.setPointerCapture(event.pointerId); engine.moveTo(canvasX(event));
    }
    function pointerMove(event) { if (dragging) { event.preventDefault(); engine.moveTo(canvasX(event)); } }
    function pointerUp(event) { dragging = false; if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); }
    function keyDown(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault(); const snapshot = engine.snapshot(); engine.moveTo(snapshot.targetX + (event.key === "ArrowLeft" ? -75 : 75));
    }
    function exitClick() { finish("exit"); }

    function destroy() {
      if (destroyed) return;
      destroyed = true; dragging = false; clearTimeout(toastTimer);
      if (raf) window.cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", pointerDown); canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp); canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("keydown", keyDown); exitButton.removeEventListener("click", exitClick);
    }

    canvas.addEventListener("pointerdown", pointerDown, { passive: false });
    canvas.addEventListener("pointermove", pointerMove, { passive: false });
    canvas.addEventListener("pointerup", pointerUp); canvas.addEventListener("pointercancel", pointerUp);
    canvas.addEventListener("keydown", keyDown); exitButton.addEventListener("click", exitClick);
    updateHud(engine.snapshot()); draw(engine.snapshot(), 0);
    raf = window.requestAnimationFrame(frame);
    return { destroy, end: function () { finish("exit"); }, getState: engine.snapshot };
  }

  return {
    WIDTH,
    HEIGHT,
    DEFAULT_ROUNDS,
    XP_PER_RESCUE,
    seededRandom,
    pointerToCourtX,
    createEngine,
    makeResult,
    mount
  };
});
