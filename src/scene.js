import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSolarSystem } from "./bodies.js";
import { setupInteraction, updateInteraction } from "./interaction.js";
import { initCameraFly, tickFlyTo, isFlyActive } from "./cameraFly.js";

// Add a textured background universe (Milky Way)
function addBackgroundUniverse(scene) {
  const geometry = new THREE.SphereGeometry(2000, 64, 64);
  const loader = new THREE.TextureLoader();
  const texture = loader.load("/textures/stars_milky_way.jpg");
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const universe = new THREE.Mesh(geometry, material);
  scene.add(universe);
}
let renderer, scene, camera, controls, bodies;

export function setupScene() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0a12);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000,
  );
  camera.position.set(0, 200, 600);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 50;
  controls.maxDistance = 3000;

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const sunLight = new THREE.PointLight(0xffffff, 3, 0, 1.5);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Background Universe (Milky Way)
  addBackgroundUniverse(scene);

  // Solar System Bodies
  const {
    bodies: systemBodies,
    saturnRingMesh,
    asteroidMeshes,
  } = createSolarSystem(scene);
  bodies = systemBodies;

  // Camera fly-in
  initCameraFly(camera, controls);

  // Interaction (raycaster, selection ring, info panel)
  setupInteraction(
    scene,
    camera,
    renderer,
    bodies,
    asteroidMeshes,
    saturnRingMesh,
  );

  window.addEventListener("resize", onWindowResize);
  animate();
}

// Removed addStarfield; only the texture background is used now.

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = (now - lastTime) * 0.001; // seconds
  lastTime = now;
  if (bodies) {
    Object.values(bodies).forEach((body) => {
      if (body.update) body.update(dt);
    });
  }
  tickFlyTo(dt);
  updateInteraction();
  // Let OrbitControls handle damping/input only when not mid-fly
  if (!isFlyActive()) controls.update();
  renderer.render(scene, camera);
}
