import * as THREE from "three";
import {
  showPanel,
  hidePanel,
  setPanelPosition,
  getPanelRect,
  isPanelVisible,
  onPanelClose,
  PANEL_W,
} from "./ui/infoPanel.js";
import { startFlyTo } from "./cameraFly.js";

const RING_COLOR = 0x00e5ff;
const PANEL_APPROX_H = 370;
const PANEL_OFFSET = 60; // px gap between body edge and panel

let _scene, _camera, _renderer, _bodies;
let raycaster, mouse;
let selectedBody = null;
let selectionGroup = null;
let meshToBody = new Map();
let _extraMeshes = [];

// SVG connector elements
let svgOverlay, svgLine, svgDot, svgDiamond;

// ─── Public API ────────────────────────────────────────────

export function setupInteraction(
  scene,
  camera,
  renderer,
  bodies,
  asteroidMeshes = [],
  saturnRingMesh = null,
) {
  _scene = scene;
  _camera = camera;
  _renderer = renderer;
  _bodies = bodies;

  // Map every standard body mesh → body instance
  for (const body of Object.values(bodies)) {
    meshToBody.set(body.mesh, body);
  }

  // Virtual body: Asteroid Belt — each small rock mesh maps to a shared descriptor.
  // The descriptor's `mesh` field is the clicked rock itself so the ring tracks it.
  if (asteroidMeshes.length) {
    asteroidMeshes.forEach((m) => {
      meshToBody.set(m, { name: "Asteroid Belt", radius: 0.7, mesh: m });
    });
    _extraMeshes.push(...asteroidMeshes);
  }

  // Virtual body: Saturn's Rings — clicking the ring shows info and flies to Saturn.
  if (saturnRingMesh && bodies.saturn) {
    const saturnBody = bodies.saturn;
    meshToBody.set(saturnRingMesh, {
      name: "Saturn's Rings",
      radius: saturnBody.radius * 2.5, // ring spans ~2.2× Saturn's radius
      mesh: saturnBody.mesh, // selection ring + world pos follows Saturn
    });
    _extraMeshes.push(saturnRingMesh);
  }

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  selectionGroup = buildSelectionGroup();
  selectionGroup.visible = false;
  scene.add(selectionGroup);

  buildSVGOverlay();

  renderer.domElement.addEventListener("click", handleClick);

  onPanelClose(() => {
    selectedBody = null;
    selectionGroup.visible = false;
    hideSVG();
  });
}

export function updateInteraction() {
  if (!selectedBody || !selectionGroup.visible) {
    hideSVG();
    return;
  }

  // Follow the body in world space
  const worldPos = new THREE.Vector3();
  selectedBody.mesh.getWorldPosition(worldPos);
  selectionGroup.position.copy(worldPos);
  selectionGroup.lookAt(_camera.position);

  // Pulse rings
  const t = performance.now() * 0.001;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.8);

  selectionGroup.children[0].material.opacity = 0.55 + 0.3 * pulse; // outer ring
  selectionGroup.children[1].material.opacity = 0.15 + 0.2 * pulse; // inner ring
  selectionGroup.children[2].material.opacity = 0.65 + 0.25 * pulse; // tick marks

  const baseScale = selectedBody.radius * 1.58;
  selectionGroup.scale.setScalar(baseScale);

  // Update SVG connector
  if (!isPanelVisible()) {
    hideSVG();
    return;
  }

  const screenPos = worldToScreen(worldPos);
  if (!screenPos) {
    hideSVG();
    return;
  }

  const rect = getPanelRect();
  if (!rect) {
    hideSVG();
    return;
  }

  // Connector attaches to the panel edge closest to the body
  const panelCX = rect.left + rect.width / 2;
  const panelCY = rect.top + rect.height / 2;
  const lineEndX = screenPos.x < panelCX ? rect.left : rect.right;
  const lineEndY = panelCY;

  svgLine.setAttribute("x1", screenPos.x);
  svgLine.setAttribute("y1", screenPos.y);
  svgLine.setAttribute("x2", lineEndX);
  svgLine.setAttribute("y2", lineEndY);
  svgLine.setAttribute("visibility", "visible");

  svgDot.setAttribute("cx", screenPos.x);
  svgDot.setAttribute("cy", screenPos.y);
  svgDot.setAttribute("visibility", "visible");

  // Diamond at panel attachment point
  const side = screenPos.x < panelCX ? -1 : 1;
  const d = 5;
  svgDiamond.setAttribute(
    "points",
    `${lineEndX},${lineEndY - d} ${lineEndX + side * d},${lineEndY} ${lineEndX},${lineEndY + d} ${lineEndX - side * d},${lineEndY}`,
  );
  svgDiamond.setAttribute("visibility", "visible");
}

// ─── Internal helpers ──────────────────────────────────────

function buildSelectionGroup() {
  const group = new THREE.Group();

  // Outer glow ring (radius = 1, scaled per body)
  const outerGeo = new THREE.RingGeometry(1.0, 1.07, 64);
  const outerMat = new THREE.MeshBasicMaterial({
    color: RING_COLOR,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(outerGeo, outerMat));

  // Inner dimmer ring
  const innerGeo = new THREE.RingGeometry(0.87, 0.92, 64);
  const innerMat = new THREE.MeshBasicMaterial({
    color: RING_COLOR,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(innerGeo, innerMat));

  // 4 cardinal tick marks
  const tickVerts = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const r1 = 1.1,
      r2 = 1.28;
    tickVerts.push(
      Math.cos(angle) * r1,
      Math.sin(angle) * r1,
      0,
      Math.cos(angle) * r2,
      Math.sin(angle) * r2,
      0,
    );
  }
  const tickGeo = new THREE.BufferGeometry();
  tickGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(tickVerts, 3),
  );
  const tickMat = new THREE.LineBasicMaterial({
    color: RING_COLOR,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  group.add(new THREE.LineSegments(tickGeo, tickMat));

  return group;
}

function buildSVGOverlay() {
  svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgOverlay.id = "ip-svg-overlay";
  svgOverlay.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  svgLine.setAttribute("class", "ip-line");
  svgLine.setAttribute("visibility", "hidden");

  svgDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  svgDot.setAttribute("class", "ip-dot");
  svgDot.setAttribute("r", "3.5");
  svgDot.setAttribute("visibility", "hidden");

  svgDiamond = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon",
  );
  svgDiamond.setAttribute("class", "ip-diamond");
  svgDiamond.setAttribute("visibility", "hidden");

  svgOverlay.appendChild(svgLine);
  svgOverlay.appendChild(svgDot);
  svgOverlay.appendChild(svgDiamond);
  document.body.appendChild(svgOverlay);
}

function hideSVG() {
  if (!svgLine) return;
  svgLine.setAttribute("visibility", "hidden");
  svgDot.setAttribute("visibility", "hidden");
  svgDiamond.setAttribute("visibility", "hidden");
}

function worldToScreen(worldPos) {
  const proj = worldPos.clone().project(_camera);
  if (proj.z > 1) return null; // behind camera
  return {
    x: (proj.x * 0.5 + 0.5) * window.innerWidth,
    y: (proj.y * -0.5 + 0.5) * window.innerHeight,
  };
}

function handleClick(event) {
  const rect = _renderer.domElement.getBoundingClientRect();
  mouse.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    ((event.clientY - rect.top) / rect.height) * -2 + 1,
  );

  raycaster.setFromCamera(mouse, _camera);
  const allMeshes = [
    ...Object.values(_bodies).map((b) => b.mesh),
    ..._extraMeshes,
  ];
  const intersects = raycaster.intersectObjects(allMeshes);

  if (intersects.length > 0) {
    const body = meshToBody.get(intersects[0].object);
    // For Asteroid Belt the descriptor holds a reference to the clicked mesh,
    // but we want the ring to follow that specific rock, so update .mesh in place.
    if (body && body.name === "Asteroid Belt") {
      body.mesh = intersects[0].object;
    }
    if (body) selectBody(body, event.clientX, event.clientY);
    else deselect();
  } else {
    deselect();
  }
}

function selectBody(body, clickX, clickY) {
  selectedBody = body;
  selectionGroup.visible = true;
  selectionGroup.scale.setScalar(body.radius * 1.58);

  showPanel(body.name);
  positionPanel(clickX, clickY);

  // Camera fly-in toward the body
  const worldPos = new THREE.Vector3();
  body.mesh.getWorldPosition(worldPos);
  const viewDist = Math.max(body.radius * 4, 80);
  startFlyTo(worldPos, viewDist);
}

function positionPanel(nearX, nearY) {
  let px, py;

  if (nearX < window.innerWidth / 2) {
    px = nearX + PANEL_OFFSET;
  } else {
    px = nearX - PANEL_OFFSET - PANEL_W;
  }

  py = nearY - PANEL_APPROX_H / 2;

  // Clamp to viewport
  px = Math.max(16, Math.min(window.innerWidth - PANEL_W - 16, px));
  py = Math.max(16, Math.min(window.innerHeight - PANEL_APPROX_H - 16, py));

  setPanelPosition(px, py);
}

function deselect() {
  selectedBody = null;
  selectionGroup.visible = false;
  hidePanel();
  hideSVG();
}
