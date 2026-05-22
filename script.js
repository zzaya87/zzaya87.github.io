/* Theme toggle */
const themeToggle = document.getElementById("theme-toggle");
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateButtonLabel(theme);
}

function updateButtonLabel(theme) {
  if (theme === "dark") {
    themeToggle.textContent = "☀️ 라이트 모드";
    themeToggle.setAttribute("aria-label", "라이트 모드로 전환");
  } else {
    themeToggle.textContent = "🌙 다크 모드";
    themeToggle.setAttribute("aria-label", "다크 모드로 전환");
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme") || "light";
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

setTheme(localStorage.getItem("theme") || "light");

/* Scroll-driven 2.5D business card animation */
const scrollStage = document.getElementById("scroll-stage");
const root = document.documentElement;

const CARD_RATIO = 1.586;
const FLIP_START = 0.08;
const FLIP_END = 0.38;
const EXPAND_START = 0.38;
const EXPAND_END = 0.72;
const REVEAL_START = 0.72;
const REVEAL_END = 1.0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function mapRange(progress, start, end) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return easeInOutCubic((progress - start) / (end - start));
}

function getNavHeight() {
  return parseFloat(getComputedStyle(root).getPropertyValue("--nav-height")) || 64;
}

function getBaseCardSize() {
  const maxW = Math.min(380, window.innerWidth * 0.88);
  return { width: maxW, height: maxW / CARD_RATIO };
}

function updateCardAnimation() {
  if (!scrollStage) return;

  const navHeight = getNavHeight();
  const stageTop = scrollStage.offsetTop;
  const stageHeight = scrollStage.offsetHeight;
  const scrollRange = stageHeight - window.innerHeight;
  const scrolled = window.scrollY - stageTop;
  const progress = scrollRange > 0 ? clamp(scrolled / scrollRange, 0, 1) : 0;

  const flip = mapRange(progress, FLIP_START, FLIP_END);
  const expand = mapRange(progress, EXPAND_START, EXPAND_END);
  const reveal = mapRange(progress, REVEAL_START, REVEAL_END);

  const { width: baseW, height: baseH } = getBaseCardSize();
  const targetW = window.innerWidth;
  const targetH = window.innerHeight - navHeight;

  root.style.setProperty("--flip", flip.toFixed(4));
  root.style.setProperty("--expand", expand.toFixed(4));
  root.style.setProperty("--reveal", reveal.toFixed(4));

  root.style.setProperty("--tilt-x", `${lerp(18, 0, expand).toFixed(2)}deg`);
  root.style.setProperty("--tilt-y", `${lerp(-12, 0, expand).toFixed(2)}deg`);
  root.style.setProperty("--tilt-z", `${lerp(-5, 0, expand).toFixed(2)}deg`);

  const cardW = lerp(baseW, targetW, expand);
  const cardH = lerp(baseH, targetH, expand);
  root.style.setProperty("--card-w", `${cardW.toFixed(1)}px`);
  root.style.setProperty("--card-h", `${cardH.toFixed(1)}px`);
  root.style.setProperty("--card-expand-radius", `${lerp(12, 0, expand).toFixed(1)}px`);

  document.body.classList.toggle("resume-active", progress >= 0.88);

  const hint = document.getElementById("scroll-hint");
  if (hint) {
    hint.textContent =
      flip < 0.05
        ? "아래로 스크롤하여 명함을 뒤집어 보세요"
        : flip < 0.95 && expand < 0.1
          ? "계속 스크롤하면 상세 이력이 펼쳐집니다"
          : "이력서를 확인하세요";
  }
}

let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateCardAnimation();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateCardAnimation);

updateCardAnimation();

/* Reduced motion: skip scroll stage, show resume immediately */
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  root.style.setProperty("--flip", "1");
  root.style.setProperty("--expand", "1");
  root.style.setProperty("--reveal", "1");
  document.body.classList.add("resume-active");
  if (scrollStage) scrollStage.style.height = "auto";
}
