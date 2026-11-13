import { SystemBars, SystemBarsStyle } from "@capacitor/core";
import { useSettingsStore } from "../state/settingsStore";
import { isApp } from "../platform";

// Turns the saved settings into attributes on <html> that the CSS reads:
//   data-theme="light|dark"   data-text="small|medium|large"
//   .reduce-motion            .high-contrast
// In the apps it also keeps the status/home bar strips (and the status bar
// icons) matching whatever screen is showing.

const root = document.documentElement;
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// The phone's own "reduce motion" setting counts too
export function prefersLessMotion() {
  return useSettingsStore.getState().reduceMotion || motionQuery.matches;
}

function apply() {
  const s = useSettingsStore.getState();
  const dark = s.theme === "Dark" || (s.theme === "System" && darkQuery.matches);
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.text = s.textSize.toLowerCase();
  root.classList.toggle("reduce-motion", prefersLessMotion());
  root.classList.toggle("high-contrast", s.highContrast);
  scheduleBars();
}

// --- Status/home bar strips (apps only) ---

// Every screen is a full-screen layer with one of these classes. The last one
// in the page is the one on top (Settings sits over Home, for example).
const SCREENS = ".intro, .aval, .home, .set, .cap, .brad, .rcpt-page, .over, .cplus, .crash, .term, .win";

function luminance(color: string) {
  const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? ["255", "255", "255"]).map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

let lastBar = "";
function updateBars() {
  const screens = document.querySelectorAll<HTMLElement>(SCREENS);
  const top = screens[screens.length - 1];
  if (!top) return;
  const color = getComputedStyle(top).backgroundColor;
  if (!color || color === "rgba(0, 0, 0, 0)" || color === lastBar) return;
  lastBar = color;
  root.style.setProperty("--bar-bg", color);
  // Dark screen → light icons, and the other way round
  const style = luminance(color) < 0.5 ? SystemBarsStyle.Dark : SystemBarsStyle.Light;
  SystemBars.setStyle({ style }).catch(() => {});
}

let queued = false;
function scheduleBars() {
  if (!isApp || queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    updateBars();
  });
}

export function startSettings() {
  apply();
  useSettingsStore.subscribe(apply);
  darkQuery.addEventListener("change", apply);
  motionQuery.addEventListener("change", apply);
  if (isApp) {
    // Screens change by swapping elements (and Brad's page by class)
    new MutationObserver(scheduleBars).observe(document.getElementById("root")!, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }
}
