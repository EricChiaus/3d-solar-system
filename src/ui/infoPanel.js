import "./infoPanel.css";
import solarSystemData from "../data/solarSystemData.js";

const PANEL_W = 290;

let panelEl = null;
let typeEl, nameEl, statsEl, descEl;
let _onCloseCallback = null;

function buildPanel() {
  panelEl = document.createElement("div");
  panelEl.id = "ip-modal";
  panelEl.className = "ip-hidden";
  panelEl.innerHTML = `
    <div class="ip-corner ip-corner--tl"></div>
    <div class="ip-corner ip-corner--tr"></div>
    <div class="ip-corner ip-corner--bl"></div>
    <div class="ip-corner ip-corner--br"></div>
    <div class="ip-header">
      <span class="ip-type"></span>
      <button class="ip-close" aria-label="Close">✕</button>
    </div>
    <div class="ip-name"></div>
    <div class="ip-divider"></div>
    <div class="ip-stats"></div>
    <div class="ip-desc"></div>
  `;
  document.body.appendChild(panelEl);

  typeEl = panelEl.querySelector(".ip-type");
  nameEl = panelEl.querySelector(".ip-name");
  statsEl = panelEl.querySelector(".ip-stats");
  descEl = panelEl.querySelector(".ip-desc");

  panelEl.querySelector(".ip-close").addEventListener("click", () => {
    hidePanel();
    if (_onCloseCallback) _onCloseCallback();
  });
}

export function onPanelClose(cb) {
  _onCloseCallback = cb;
}

export function showPanel(bodyName) {
  if (!panelEl) buildPanel();

  const data = solarSystemData[bodyName];
  if (!data) return;

  typeEl.textContent = data.type;
  nameEl.textContent = bodyName;
  descEl.textContent = data.description;

  const statDefs = [
    { label: "Diameter", value: data.diameter },
    { label: "Mass", value: data.mass },
    { label: "Distance", value: data.distanceFromSun },
    { label: "Period", value: data.orbitalPeriod },
    { label: "Moons", value: data.moons },
    { label: "Temp", value: data.surfaceTemp },
  ];

  statsEl.innerHTML = statDefs
    .map(
      (s) => `
    <div class="ip-stat">
      <div class="ip-stat-dot"></div>
      <span class="ip-stat-label">${s.label}</span>
      <span class="ip-stat-value">${s.value}</span>
    </div>`,
    )
    .join("");

  panelEl.classList.remove("ip-hidden");
  // force reflow so transition fires
  void panelEl.offsetWidth;
  panelEl.classList.add("ip-visible");
}

export function hidePanel() {
  if (!panelEl) return;
  panelEl.classList.remove("ip-visible");
  setTimeout(() => {
    if (panelEl && !panelEl.classList.contains("ip-visible")) {
      panelEl.classList.add("ip-hidden");
    }
  }, 250);
}

export function setPanelPosition(x, y) {
  if (!panelEl) return;
  panelEl.style.left = x + "px";
  panelEl.style.top = y + "px";
}

export function getPanelRect() {
  if (!panelEl || panelEl.classList.contains("ip-hidden")) return null;
  return panelEl.getBoundingClientRect();
}

export function isPanelVisible() {
  return panelEl != null && panelEl.classList.contains("ip-visible");
}

export { PANEL_W };
