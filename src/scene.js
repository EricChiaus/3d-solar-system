
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSolarSystem } from './bodies.js';
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
    10000
  );
  camera.position.set(0, 200, 600);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 50;
  controls.maxDistance = 3000;

  // Lighting
  const ambient = new THREE.AmbientLight(0x222244, 0.7);
  scene.add(ambient);
  const sunLight = new THREE.PointLight(0xfff6e0, 2, 0, 2);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Starfield
  addStarfield();

  // Solar System Bodies
  bodies = createSolarSystem(scene);

  window.addEventListener('resize', onWindowResize);
  animate();
}

function addStarfield() {
  const starCount = 10000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    const r = 3000 + Math.random() * 2000;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x00e5ff, size: 1, sizeAttenuation: true });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

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
    Object.values(bodies).forEach(body => {
      if (body.update) body.update(dt);
    });
  }
  controls.update();
  renderer.render(scene, camera);
}
