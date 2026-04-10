import * as THREE from "three";
import solarSystemData from "./data/solarSystemData.js";

// Local textures for planets, moon, sun, and Saturn's ring
const planetTextures = {
  Mercury: "/textures/mercury.jpg",
  Venus: "/textures/venus.jpg",
  Earth: "/textures/earth.jpg",
  Mars: "/textures/mars.jpg",
  Jupiter: "/textures/jupiter.jpg",
  Saturn: "/textures/saturn.jpg",
  Uranus: "/textures/uranus.jpg",
  Neptune: "/textures/neptune.jpg",
  Moon: "/textures/moon.jpg",
  Sun: "/textures/sun.jpg",
  SaturnRing: "/textures/saturn_ring_alpha.png",
  Starfield: "/textures/stars_milky_way.jpg",
};
export class CelestialBody {
  constructor({
    name,
    radius,
    color,
    orbitRadius,
    orbitSpeed,
    tilt = 0,
    parent = null,
    emissive = false,
    textureUrl = null,
  }) {
    this.name = name;
    this.radius = radius;
    this.color = color;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.tilt = tilt;
    this.parent = parent;
    this.theta = Math.random() * Math.PI * 2;
    this.mesh = this.createMesh(emissive, textureUrl);
    this.orbitGroup = new THREE.Group();
    this.orbitGroup.add(this.mesh);
    if (parent) parent.orbitGroup.add(this.orbitGroup);
    this.setInitialPosition();
    if (this.orbitRadius > 0) {
      this.addOrbitRing();
    }
  }

  createMesh(emissive, textureUrl) {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const loader = new THREE.TextureLoader();
    let material;
    if (emissive) {
      // Self-luminous body (Sun): use MeshBasicMaterial so texture shows without lighting
      const texture = textureUrl ? loader.load(textureUrl) : null;
      material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
      });
    } else if (textureUrl) {
      const texture = loader.load(textureUrl);
      material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture,
        metalness: 0.0,
        roughness: 1.0,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: this.color,
        metalness: 0.0,
        roughness: 1.0,
      });
    }
    return new THREE.Mesh(geometry, material);
  }

  addOrbitRing() {
    const segments = 128;
    const geometry = new THREE.RingGeometry(
      this.orbitRadius - 0.2,
      this.orbitRadius + 0.2,
      segments,
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    this.orbitGroup.add(ring);
  }

  setInitialPosition() {
    this.mesh.position.set(this.orbitRadius, 0, 0);
    this.mesh.rotation.z = this.tilt;
  }

  update(dt) {
    if (this.orbitRadius > 0) {
      this.theta += this.orbitSpeed * dt;
      this.mesh.position.x = this.orbitRadius * Math.cos(this.theta);
      this.mesh.position.z = this.orbitRadius * Math.sin(this.theta);
    }
    this.mesh.rotation.y += 0.01 * (this.orbitSpeed + 0.1); // simple rotation
  }
}

// Factory to create all solar system bodies
export function createSolarSystem(scene) {
  const bodies = {};
  // Sun
  bodies.sun = new CelestialBody({
    name: "Sun",
    radius: 40,
    color: 0xfff6e0,
    orbitRadius: 0,
    orbitSpeed: 0,
    emissive: true,
    textureUrl: planetTextures.Sun,
  });
  scene.add(bodies.sun.orbitGroup);

  // Planets
  // Orbital distances in AU
  // Orbital distances in AU and realistic colors/textures
  const planetData = [
    {
      name: "Mercury",
      radius: 3,
      color: 0xb1b1b1,
      au: 0.39,
      orbitSpeed: 0.04,
      textureUrl: planetTextures.Mercury,
    },
    {
      name: "Venus",
      radius: 6,
      color: 0xeed8b6,
      au: 0.72,
      orbitSpeed: 0.03,
      textureUrl: planetTextures.Venus,
    },
    {
      name: "Earth",
      radius: 7,
      color: 0x3399ff,
      au: 1.0,
      orbitSpeed: 0.025,
      textureUrl: planetTextures.Earth,
    },
    {
      name: "Mars",
      radius: 5,
      color: 0xff5533,
      au: 1.52,
      orbitSpeed: 0.02,
      textureUrl: planetTextures.Mars,
    },
    {
      name: "Jupiter",
      radius: 15,
      color: 0xf4e2b8,
      au: 5.2,
      orbitSpeed: 0.008,
      textureUrl: planetTextures.Jupiter,
    },
    {
      name: "Saturn",
      radius: 13,
      color: 0xf5deb3,
      au: 9.58,
      orbitSpeed: 0.006,
      textureUrl: planetTextures.Saturn,
    },
    {
      name: "Uranus",
      radius: 10,
      color: 0x7fffd4,
      au: 19.18,
      orbitSpeed: 0.004,
      textureUrl: planetTextures.Uranus,
    },
    {
      name: "Neptune",
      radius: 10,
      color: 0x3366ff,
      au: 30.07,
      orbitSpeed: 0.003,
      textureUrl: planetTextures.Neptune,
    },
  ];

  // Log-scaled mapping with offset for inner planets (Neptune at 350 units, Mercury at 40)
  function mapAUtoScene(au) {
    const min = 60; // minimum orbit radius (greater than Sun's radius)
    const max = 350;
    const logMin = Math.log10(0.39);
    const logMax = Math.log10(30.07);
    const logAU = Math.log10(au);
    return Math.round(
      min + ((max - min) * (logAU - logMin)) / (logMax - logMin),
    );
  }

  const planetDefs = planetData.map((def) => ({
    ...def,
    orbitRadius: mapAUtoScene(def.au),
  }));
  planetDefs.forEach((def) => {
    bodies[def.name.toLowerCase()] = new CelestialBody({ ...def });
    bodies.sun.orbitGroup.add(bodies[def.name.toLowerCase()].orbitGroup);
  });

  // Earth's Moon — parent to Earth's mesh so it follows Earth's position
  bodies.moon = new CelestialBody({
    name: "Moon",
    radius: 2,
    color: 0xbbbbbb,
    orbitRadius: 14,
    orbitSpeed: 0.08,
    textureUrl: planetTextures.Moon,
  });
  bodies.earth.mesh.add(bodies.moon.orbitGroup);

  // Saturn's Rings
  const saturnRingMesh = addSaturnRings(bodies.saturn);

  // Asteroid Belt
  const asteroidMeshes = addAsteroidBelt(bodies.sun.orbitGroup);

  return { bodies, saturnRingMesh, asteroidMeshes };
}

function addSaturnRings(saturnBody) {
  if (!saturnBody) return;
  const innerRadius = saturnBody.radius * 1.3;
  const outerRadius = saturnBody.radius * 2.2;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);

  // Fix RingGeometry UVs: remap so U = radial (inner→outer), V = angle (around ring)
  // Default Three.js RingGeometry UVs project the texture as a flat square, not radially
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const r = Math.sqrt(v3.x * v3.x + v3.y * v3.y);
    const u = (r - innerRadius) / (outerRadius - innerRadius);
    const angle = (Math.atan2(v3.y, v3.x) + Math.PI) / (2 * Math.PI);
    uv.setXY(i, u, angle);
  }

  const loader = new THREE.TextureLoader();
  const texture = loader.load(planetTextures.SaturnRing);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  saturnBody.mesh.add(ring);
  return ring;
}

function addAsteroidBelt(parentGroup) {
  const beltCount = 400;
  const inner = 155,
    outer = 175;
  const geometry = new THREE.SphereGeometry(0.7, 6, 6);
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.8,
  });
  const meshes = [];
  for (let i = 0; i < beltCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = inner + Math.random() * (outer - inner);
    const y = (Math.random() - 0.5) * 4;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(r * Math.cos(theta), y, r * Math.sin(theta));
    parentGroup.add(mesh);
    meshes.push(mesh);
  }
  return meshes;
}
