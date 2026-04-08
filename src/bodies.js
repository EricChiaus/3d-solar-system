import * as THREE from 'three';
import solarSystemData from './data/solarSystemData.js';

export class CelestialBody {
	constructor({ name, radius, color, orbitRadius, orbitSpeed, tilt = 0, parent = null, emissive = false }) {
		this.name = name;
		this.radius = radius;
		this.color = color;
		this.orbitRadius = orbitRadius;
		this.orbitSpeed = orbitSpeed;
		this.tilt = tilt;
		this.parent = parent;
		this.theta = Math.random() * Math.PI * 2;
		this.mesh = this.createMesh(emissive);
		this.orbitGroup = new THREE.Group();
		this.orbitGroup.add(this.mesh);
		if (parent) parent.orbitGroup.add(this.orbitGroup);
		this.setInitialPosition();
		if (this.orbitRadius > 0) {
			this.addOrbitRing();
		}
	}

	createMesh(emissive) {
		const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
		const material = new THREE.MeshStandardMaterial({
			color: this.color,
			emissive: emissive ? this.color : 0x000000,
			emissiveIntensity: emissive ? 1.5 : 0.1,
			metalness: 0.2,
			roughness: 0.7,
		});
		return new THREE.Mesh(geometry, material);
	}

	addOrbitRing() {
		const segments = 128;
		const geometry = new THREE.RingGeometry(this.orbitRadius - 0.2, this.orbitRadius + 0.2, segments);
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
		name: 'Sun',
		radius: 40,
		color: 0xfff6e0,
		orbitRadius: 0,
		orbitSpeed: 0,
		emissive: true,
	});
	scene.add(bodies.sun.orbitGroup);

	// Planets
	// Orbital distances in AU
	const planetData = [
		{ name: 'Mercury', radius: 3, color: 0xaaaaaa, au: 0.39, orbitSpeed: 0.04 },
		{ name: 'Venus', radius: 6, color: 0xffe5b4, au: 0.72, orbitSpeed: 0.03 },
		{ name: 'Earth', radius: 7, color: 0x3399ff, au: 1.00, orbitSpeed: 0.025 },
		{ name: 'Mars', radius: 5, color: 0xff5533, au: 1.52, orbitSpeed: 0.02 },
		{ name: 'Jupiter', radius: 15, color: 0xffe0b0, au: 5.20, orbitSpeed: 0.008 },
		{ name: 'Saturn', radius: 13, color: 0xffd27f, au: 9.58, orbitSpeed: 0.006 },
		{ name: 'Uranus', radius: 10, color: 0x66ffff, au: 19.18, orbitSpeed: 0.004 },
		{ name: 'Neptune', radius: 10, color: 0x3366ff, au: 30.07, orbitSpeed: 0.003 },
		{ name: 'Pluto', radius: 2, color: 0xcccccc, au: 39.48, orbitSpeed: 0.002 },
	];

	// Log-scaled mapping with offset for inner planets (Neptune at 350 units, Mercury at 40)
	function mapAUtoScene(au) {
		const min = 60; // minimum orbit radius (greater than Sun's radius)
		const max = 350;
		const logMin = Math.log10(0.39);
		const logMax = Math.log10(30.07);
		const logAU = Math.log10(au);
		return Math.round(min + (max - min) * (logAU - logMin) / (logMax - logMin));
	}

	const planetDefs = planetData.map(def => ({
		...def,
		orbitRadius: mapAUtoScene(def.au),
	}));
	planetDefs.forEach(def => {
		bodies[def.name.toLowerCase()] = new CelestialBody({ ...def });
		bodies.sun.orbitGroup.add(bodies[def.name.toLowerCase()].orbitGroup);
	});

	// Earth's Moon
	bodies.moon = new CelestialBody({
		name: 'Moon',
		radius: 2,
		color: 0xbbbbbb,
		orbitRadius: 14,
		orbitSpeed: 0.08,
		parent: bodies.earth,
	});

	// Saturn's Rings
	addSaturnRings(bodies.saturn);

	// Asteroid Belt
	addAsteroidBelt(bodies.sun.orbitGroup);

	return bodies;
}

function addSaturnRings(saturnBody) {
	if (!saturnBody) return;
	const innerRadius = saturnBody.radius * 1.3;
	const outerRadius = saturnBody.radius * 2.2;
	const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
	const material = new THREE.MeshBasicMaterial({
		color: 0xffe0b0,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.5,
		depthWrite: false,
	});
	const ring = new THREE.Mesh(geometry, material);
	ring.rotation.x = Math.PI / 2;
	// Attach the ring to Saturn's mesh so it always follows the planet
	saturnBody.mesh.add(ring);
}

function addAsteroidBelt(parentGroup) {
	const beltCount = 400;
	const inner = 155, outer = 175;
	const geometry = new THREE.SphereGeometry(0.7, 6, 6);
	const material = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
	for (let i = 0; i < beltCount; i++) {
		const theta = Math.random() * Math.PI * 2;
		const r = inner + Math.random() * (outer - inner);
		const y = (Math.random() - 0.5) * 4;
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(r * Math.cos(theta), y, r * Math.sin(theta));
		parentGroup.add(mesh);
	}
}
