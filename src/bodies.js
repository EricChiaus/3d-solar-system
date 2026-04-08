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
	const planetDefs = [
		{ name: 'Mercury', radius: 3, color: 0xaaaaaa, orbitRadius: 60, orbitSpeed: 0.04 },
		{ name: 'Venus', radius: 6, color: 0xffe5b4, orbitRadius: 80, orbitSpeed: 0.03 },
		{ name: 'Earth', radius: 7, color: 0x3399ff, orbitRadius: 110, orbitSpeed: 0.025 },
		{ name: 'Mars', radius: 5, color: 0xff5533, orbitRadius: 140, orbitSpeed: 0.02 },
		{ name: 'Jupiter', radius: 15, color: 0xffe0b0, orbitRadius: 180, orbitSpeed: 0.008 },
		{ name: 'Saturn', radius: 13, color: 0xffd27f, orbitRadius: 220, orbitSpeed: 0.006 },
		{ name: 'Uranus', radius: 10, color: 0x66ffff, orbitRadius: 260, orbitSpeed: 0.004 },
		{ name: 'Neptune', radius: 10, color: 0x3366ff, orbitRadius: 300, orbitSpeed: 0.003 },
		{ name: 'Pluto', radius: 2, color: 0xcccccc, orbitRadius: 340, orbitSpeed: 0.002 },
	];
	planetDefs.forEach(def => {
		bodies[def.name.toLowerCase()] = new CelestialBody({ ...def });
		bodies.sun.orbitGroup.add(bodies[def.name.toLowerCase()].orbitGroup);
	});

	return bodies;
}
