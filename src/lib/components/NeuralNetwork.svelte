<script>
	import { onDestroy, onMount } from 'svelte';
	import { Canvas, T } from '@threlte/core';
	import NetworkGroup from './NetworkGroup.svelte';
	import * as THREE from 'three';
	import Axon from './Axon.svelte';
	import Neuron from './Neuron.svelte';
	import Pulse from './Pulse.svelte';


	export let targetCount = 12;
	export let onComplete = () => {};

	const networkRadius = 3.4;
	const maxPulses = 6;
	const minSeparation = 0.9;
	const spawnAttempts = 24;
	const repulsionEpsilon = 0.2;
	const outwardBias = 0.7;
	const clearanceBias = 0.25;

	let neurons = [{ id: 0, pos: [0, 0, 0], type: 'standard' }];
	let axons = [];
	let pulses = [];
	let triggers = {};
	let mounted = false;
	let containerWidth = 0;
	let containerHeight = 0;
	let onResize;
	let dpr = 1;

	export let reducedMotion = false;

	let axonId = 0;
	let pulseId = 0;

	let spawnTimer;
	let pulseTimer;
	let completeCall;
	let finalWaveDone = false;

	const pickType = () => {
		const r = Math.random();
		if (r < 0.72) return 'standard';
		if (r < 0.86) return 'ekg';
		return 'pulseox';
	};

	const randomSpherePoint = (radius) => {
		const u = Math.random();
		const v = Math.random();
		const theta = u * Math.PI * 2;
		const phi = Math.acos(2 * v - 1);
		const rr = radius * Math.cbrt(Math.random());
		const sinPhi = Math.sin(phi);
		return [rr * sinPhi * Math.cos(theta), rr * sinPhi * Math.sin(theta), rr * Math.cos(phi)];
	};

	const normalize = ([x, y, z]) => {
		const len = Math.hypot(x, y, z) || 1;
		return [x / len, y / len, z / len];
	};

	const randomUnitVector = () => {
		const u = Math.random();
		const v = Math.random();
		const theta = u * Math.PI * 2;
		const phi = Math.acos(2 * v - 1);
		const sinPhi = Math.sin(phi);
		return [sinPhi * Math.cos(theta), sinPhi * Math.sin(theta), Math.cos(phi)];
	};

	const isFarEnough = (pos) => {
		for (const n of neurons) {
			const dx = pos[0] - n.pos[0];
			const dy = pos[1] - n.pos[1];
			const dz = pos[2] - n.pos[2];
			if (Math.hypot(dx, dy, dz) < minSeparation) return false;
		}
		return true;
	};

	const candidateEnergy = (pos) => {
		let repulsion = 0;
		let minDist = Infinity;
		for (const n of neurons) {
			const dx = pos[0] - n.pos[0];
			const dy = pos[1] - n.pos[1];
			const dz = pos[2] - n.pos[2];
			const d = Math.hypot(dx, dy, dz);
			minDist = Math.min(minDist, d);
			repulsion += 1 / (d * d + repulsionEpsilon);
		}
		const radial = Math.hypot(pos[0], pos[1], pos[2]) / networkRadius;
		return repulsion - radial * outwardBias - minDist * clearanceBias;
	};

	const spawnChildPos = (from) => {
		const fromLen = Math.hypot(from[0], from[1], from[2]);
		const baseDir = fromLen > 0.001 ? normalize(from) : randomUnitVector();
		const randDir = randomUnitVector();
		const mix = 0.65;
		const dir = normalize([
			baseDir[0] * mix + randDir[0] * (1 - mix),
			baseDir[1] * mix + randDir[1] * (1 - mix),
			baseDir[2] * mix + randDir[2] * (1 - mix)
		]);
		const distance = 1.3 + Math.random() * 1.1;
		let x = from[0] + dir[0] * distance;
		let y = from[1] + dir[1] * distance;
		let z = from[2] + dir[2] * distance;
		const len = Math.hypot(x, y, z);
		if (len > networkRadius) {
			const scale = (networkRadius * 0.98) / len;
			x *= scale;
			y *= scale;
			z *= scale;
		}
		return [x, y, z];
	};

	const createCurve = (from, to) => {
		const start = new THREE.Vector3(...from);
		const end = new THREE.Vector3(...to);
		const mid = start.clone().lerp(end, 0.5);
		mid.add(
			new THREE.Vector3((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9)
		);
		return new THREE.CatmullRomCurve3([start, mid, end]);
	};

	const neuronById = (id) => neurons.find((n) => n.id === id);

	const addAxon = (fromId, toId) => {
		const from = neuronById(fromId)?.pos;
		const to = neuronById(toId)?.pos;
		if (!from || !to) return;
		const curve = createCurve(from, to);
		axons = [...axons, { id: axonId++, fromId, toId, curve }];
	};

	const pushPulse = (from, to, targetId, color, baseDuration, jitter) => {
		pulses = [
			...pulses,
			{
				id: pulseId++,
				curve: createCurve(from, to),
				targetId,
				color,
				duration: baseDuration + Math.random() * jitter
			}
		];
	};

	const spawnPulse = () => {
		if (pulses.length >= maxPulses || axons.length === 0) return;

		const axon = axons[Math.floor(Math.random() * axons.length)];
		const reverse = Math.random() < 0.5;
		const from = neuronById(reverse ? axon.toId : axon.fromId)?.pos;
		const to = neuronById(reverse ? axon.fromId : axon.toId)?.pos;
		if (!from || !to) return;

		pushPulse(from, to, reverse ? axon.fromId : axon.toId, '#65f7ff', 0.55, 0.25);
	};

	const onPulseArrive = (id, targetId) => {
		triggers = { ...triggers, [targetId]: (triggers[targetId] ?? 0) + 1 };
		pulses = pulses.filter((p) => p.id !== id);
	};

	const scheduleComplete = () => {
		clearTimeout(completeCall);
		// setTimeout instead of a rAF-driven GSAP timer so completion still
		// fires in throttled background tabs.
		completeCall = setTimeout(() => {
			onComplete();
		}, 900);
	};

	// --- Pointer reactivity: neurons near the cursor fire and emit pulses ---
	// NetworkGroup mutates this in place each frame, so the projection below
	// always uses the group's true rotation (no drift under rAF throttling).
	const groupRotation = { x: 0, y: 0 };
	let lastFire = 0;
	let onPointerMove;
	let onPointerDown;

	const fireAt = (clientX, clientY, burst = false) => {
		if (!neurons.length || !containerWidth || !containerHeight) return;

		const ndcX = (clientX / containerWidth) * 2 - 1;
		const ndcY = -((clientY / containerHeight) * 2 - 1);

		const cosY = Math.cos(groupRotation.y);
		const sinY = Math.sin(groupRotation.y);
		const cosX = Math.cos(groupRotation.x);
		const sinX = Math.sin(groupRotation.x);
		const aspect = containerWidth / containerHeight;
		const halfH = Math.tan((48 * Math.PI) / 360);

		let best = null;
		let bestD = Infinity;
		for (const n of neurons) {
			const [x, y, z] = n.pos;
			const x1 = x * cosY + z * sinY;
			const z1 = -x * sinY + z * cosY;
			const y1 = y * cosX - z1 * sinX;
			const z2 = y * sinX + z1 * cosX;
			const dist = 7 - z2;
			if (dist <= 0.1) continue;
			const sx = x1 / (dist * halfH * aspect);
			const sy = y1 / (dist * halfH);
			const d = Math.hypot(sx - ndcX, sy - ndcY);
			if (d < bestD) {
				bestD = d;
				best = n;
			}
		}

		if (!best || bestD > (burst ? 0.9 : 0.4)) return;

		triggers = { ...triggers, [best.id]: (triggers[best.id] ?? 0) + 1 };

		const connected = axons.filter((a) => a.fromId === best.id || a.toId === best.id);
		const limit = burst ? connected.length : 2;
		let spawned = 0;
		for (const axon of connected) {
			if (spawned >= limit || pulses.length >= maxPulses + 6) break;
			const outward = axon.fromId === best.id;
			const to = neuronById(outward ? axon.toId : axon.fromId)?.pos;
			if (!to) continue;
			pushPulse(best.pos, to, outward ? axon.toId : axon.fromId, '#9df9ff', 0.35, 0.2);
			spawned += 1;
		}
	};

	onMount(() => {
		const updateSize = () => {
			containerWidth = Math.max(1, window.innerWidth);
			containerHeight = Math.max(1, window.innerHeight);
		};
		updateSize();
		dpr = Math.min(1.5, window.devicePixelRatio || 1);
		onResize = () => updateSize();
		window.addEventListener('resize', onResize, { passive: true });
		mounted = true;

		if (reducedMotion) {
			// Skip animation, complete immediately
			// disable for debugging:
			// scheduleComplete();
			return;
		}

		const spawnWave = () => {
			const runFinalWave = !finalWaveDone && neurons.length >= targetCount;
			const maxNodes = runFinalWave ? targetCount * 2 : targetCount;

			const snapshot = [...neurons];
			for (const parent of snapshot) {
				if (neurons.length >= maxNodes) break;
				let best = null;
				let bestEnergy = Infinity;
				for (let attempt = 0; attempt < spawnAttempts; attempt += 1) {
					const candidate = spawnChildPos(parent.pos);
					if (!isFarEnough(candidate)) continue;
					const energy = candidateEnergy(candidate);
					if (energy < bestEnergy) {
						bestEnergy = energy;
						best = candidate;
					}
				}
				if (!best && neurons.length < maxNodes) {
					for (let attempt = 0; attempt < spawnAttempts; attempt += 1) {
						const candidate = randomSpherePoint(networkRadius);
						if (!isFarEnough(candidate)) continue;
						const energy = candidateEnergy(candidate);
						if (energy < bestEnergy) {
							bestEnergy = energy;
							best = candidate;
						}
					}
				}
				if (best) {
					const id = neurons.length;
					const next = { id, pos: best, type: pickType() };
					neurons = [...neurons, next];
					addAxon(parent.id, next.id);
				}
			}

			if (runFinalWave) {
				finalWaveDone = true;
				clearInterval(spawnTimer);
				spawnTimer = null;
				scheduleComplete();
			}
		};

		spawnTimer = setInterval(spawnWave, 420);

		pulseTimer = setInterval(() => {
			spawnPulse();
		}, 300);

		onPointerMove = (e) => {
			const now = performance.now();
			if (now - lastFire < 110) return;
			lastFire = now;
			fireAt(e.clientX, e.clientY);
		};
		onPointerDown = (e) => {
			fireAt(e.clientX, e.clientY, true);
		};
		window.addEventListener('mousemove', onPointerMove, { passive: true });
		window.addEventListener('pointerdown', onPointerDown, { passive: true });
	});

	onDestroy(() => {
		if (spawnTimer) clearInterval(spawnTimer);
		if (pulseTimer) clearInterval(pulseTimer);
		if (onResize) window.removeEventListener('resize', onResize);
		if (onPointerMove) window.removeEventListener('mousemove', onPointerMove);
		if (onPointerDown) window.removeEventListener('pointerdown', onPointerDown);
		clearTimeout(completeCall);
	});
</script>

{#if mounted}
	<div class="network">
		<Canvas
			dpr={dpr}
			renderMode="always"
			size={{ width: Math.max(1, containerWidth), height: Math.max(1, containerHeight) }}
			rendererParameters={{ alpha: true, antialias: true }}
		>
			<T.PerspectiveCamera makeDefault position={[0, 0, 7]} fov={48} near={0.1} far={80} />
			<T.AmbientLight intensity={0.25} />

			<!-- DEBUG OBJECTS -->

			<T.PointLight position={[3.5, 2.5, 6]} intensity={2.2} color="#65f7ff" />
			<T.PointLight position={[-4, -2, 6]} intensity={1.4} color="#6f6bff" />

			<!-- <NetworkGroup> -->
			<NetworkGroup rotationState={groupRotation}>
				{#each axons as axon (axon.id)}
					<Axon curve={axon.curve} />
				{/each}

				{#each neurons as neuron (neuron.id)}
					<Neuron pos={neuron.pos} type={neuron.type} trigger={triggers[neuron.id] ?? 0} />
				{/each}

				{#each pulses as pulse (pulse.id)}
					<Pulse
						curve={pulse.curve}
						color={pulse.color}
						duration={pulse.duration}
						onArrive={() => onPulseArrive(pulse.id, pulse.targetId)}
					/>
				{/each}
			</NetworkGroup>
			<!-- </NetworkGroup> -->
		</Canvas>
	</div>
{:else}
	<div class="network" />
{/if}

<style>
	.network {
		position: absolute;
		inset: 0;
		z-index: 2;
		width: 100vw;
		height: 100vh;
		min-width: 100%;
		min-height: 100%;
		background: transparent;
		pointer-events: none;
	}

	.network :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
		background: transparent !important;
	}
</style>
