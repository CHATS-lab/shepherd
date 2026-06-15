/* SHEPHERD landing — animated "execution becomes data" diagram.
   Reveals the left trace (create -> observe -> intercept -> recover) and the
   right code blocks one-by-one in the same order. Vanilla JS. */
(function () {
  "use strict";

  // copy button on the terminal block
  document.querySelectorAll(".terminal__copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.closest(".terminal").querySelector("code");
      if (code && navigator.clipboard) navigator.clipboard.writeText(code.innerText).catch(function () {});
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1200);
    });
  });

  const anim = document.getElementById("anim");
  if (!anim) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SEQ = ["create", "observe", "buggy", "intercept", "revert", "fork"];
  const DELAY = { create: 250, observe: 1100, buggy: 1950, intercept: 2800, revert: 3650, fork: 4500 };
  let timers = [];

  function reset() {
    timers.forEach(clearTimeout);
    timers = [];
    anim.querySelectorAll(".g-step, .cblock, .cimport").forEach((e) => e.classList.remove("in"));
  }
  function reveal(step) {
    anim.querySelectorAll('[data-step="' + step + '"]').forEach((e) => e.classList.add("in"));
    if (step === "create") {
      const imp = anim.querySelector(".cimport");
      if (imp) imp.classList.add("in");
    }
  }
  function run() {
    reset();
    if (reduce) { SEQ.forEach(reveal); return; }
    SEQ.forEach((s) => timers.push(setTimeout(() => reveal(s), DELAY[s])));
    timers.push(setTimeout(run, DELAY.fork + 2800)); // hold, then replay periodically
  }

  const btn = anim.querySelector(".anim__replay");
  if (btn) btn.addEventListener("click", run);

  if (reduce || !("IntersectionObserver" in window)) {
    run();
  } else {
    let played = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !played) { played = true; run(); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(anim);
  }
})();
