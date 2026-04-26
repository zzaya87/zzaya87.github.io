/**
 * 명함 2.5D: 스크롤 진행에 따라 뒤집기 → 확대 → 이력 본문
 */
(function () {
  "use strict";

  var stage = document.getElementById("card-stage");
  var tiltWrap = document.getElementById("tilt-wrap");
  var cardInner = document.getElementById("card-pivot");
  var sticky = document.getElementById("card-sticky");
  var siteNav = document.getElementById("site-nav");
  var frap = document.getElementById("frap");
  if (!stage || !tiltWrap || !cardInner || !sticky) return;

  var flipStart = 0.06;
  var flipEnd = 0.42;
  var zoomStart = 0.38;
  var zoomEnd = 0.82;
  var fadeStart = 0.78;
  var fadeEnd = 0.98;

  function clamp01(t) {
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t;
  }

  function smoothstep(t, a, b) {
    if (a === b) return t >= a ? 1 : 0;
    t = clamp01((t - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getStageProgress() {
    var y = window.scrollY;
    var st = stage.offsetTop;
    var sh = stage.offsetHeight;
    var vh = window.innerHeight;
    if (sh <= vh) return 1;
    var p = (y - st) / (sh - vh);
    return clamp01(p);
  }

  function apply(p) {
    var tiltT = 1 - smoothstep(p, 0, 0.28);
    var rotX = 12 * tiltT;
    var rotYExtra = -14 * tiltT;
    var rotZ = 3 * tiltT;

    var flip = smoothstep(p, flipStart, flipEnd);
    if (p < flipStart) flip = 0;
    var degY = flip * 180;

    var scale = 1;
    if (p >= zoomStart) {
      var zs = smoothstep(p, zoomStart, zoomEnd);
      scale = 1 + zs * 2.75;
    }

    var cardFade = 1 - smoothstep(p, fadeStart, fadeEnd);
    if (p < fadeStart) cardFade = 1;

    tiltWrap.style.setProperty("--tilt-x", rotX + "deg");
    tiltWrap.style.setProperty("--tilt-ye", rotYExtra + "deg");
    tiltWrap.style.setProperty("--tilt-z", rotZ + "deg");
    cardInner.style.setProperty("--flip-y", degY + "deg");
    cardInner.style.setProperty("--card-scale", String(scale));
    sticky.style.setProperty("--sticky-opacity", String(cardFade));

    var revealed = p > 0.9;
    document.body.classList.toggle("is-resume", revealed);
    if (siteNav) siteNav.hidden = !revealed;
    if (frap) frap.hidden = !revealed;

    var hint = document.getElementById("scroll-hint");
    if (hint) {
      hint.style.opacity = p > 0.15 ? "0" : "";
      hint.style.pointerEvents = p > 0.15 ? "none" : "";
    }
  }

  function onScroll() {
    if (prefersReducedMotion()) {
      tiltWrap.style.setProperty("--tilt-x", "0deg");
      tiltWrap.style.setProperty("--tilt-ye", "0deg");
      tiltWrap.style.setProperty("--tilt-z", "0deg");
      cardInner.style.setProperty("--flip-y", "180deg");
      cardInner.style.setProperty("--card-scale", "2.2");
      sticky.style.setProperty("--sticky-opacity", "0");
      document.body.classList.add("is-resume");
      if (siteNav) siteNav.hidden = false;
      if (frap) frap.hidden = false;
      return;
    }
    apply(getStageProgress());
  }

  var ticking = false;
  function onScrollRaf() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      onScroll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onScroll);
  } else {
    onScroll();
  }
  window.addEventListener("scroll", onScrollRaf, { passive: true });
  window.addEventListener("resize", onScrollRaf);
})();
