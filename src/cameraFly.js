import * as THREE from "three";

let _camera = null;
let _controls = null;

let flyActive = false;
const flyStartPos = new THREE.Vector3();
const flyEndPos = new THREE.Vector3();
const flyStartTarget = new THREE.Vector3();
const flyEndTarget = new THREE.Vector3();
let flyT = 0;
const FLY_DURATION = 1.5; // seconds

export function initCameraFly(camera, controls) {
  _camera = camera;
  _controls = controls;
}

/**
 * Start a smooth camera fly-in toward `worldPos`.
 * The camera will stop `viewDistance` units away, keeping its current
 * approach direction so the motion feels natural.
 */
export function startFlyTo(worldPos, viewDistance) {
  if (!_camera) return;

  flyStartPos.copy(_camera.position);
  flyStartTarget.copy(_controls.target);
  flyEndTarget.copy(worldPos);

  // Direction from target to current camera — we arrive from the same side
  const dir = _camera.position.clone().sub(worldPos);
  if (dir.lengthSq() < 0.0001) dir.set(0, 0.6, 1);
  dir.normalize();
  flyEndPos.copy(worldPos).addScaledVector(dir, viewDistance);

  flyT = 0;
  flyActive = true;
}

/**
 * Advance the fly animation by `dt` seconds.
 * Must be called every frame from the main animation loop.
 */
export function tickFlyTo(dt) {
  if (!flyActive || !_camera) return;

  flyT = Math.min(flyT + dt / FLY_DURATION, 1);
  const t = easeInOut(flyT);

  _camera.position.lerpVectors(flyStartPos, flyEndPos, t);
  _controls.target.lerpVectors(flyStartTarget, flyEndTarget, t);

  if (flyT >= 1) flyActive = false;
}

export function isFlyActive() {
  return flyActive;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
