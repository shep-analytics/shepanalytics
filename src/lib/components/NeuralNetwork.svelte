<script>
	import { onDestroy, onMount } from 'svelte';
	import { Canvas, T } from '@threlte/core';
	import NetworkGroup from './NetworkGroup.svelte';
	import { gsap } from 'gsap';
	import * as THREE from 'three';
	import Axon from './Axon.svelte';
	import Neuron from './Neuron.svelte';
	import Pulse from './Pulse.svelte';

	export let targetCount = 12;
	export let onComplete = () => {};

	const networkRadius = 3;
	const maxPulses = 6;

	let neurons = [{ id: 0, pos: [0, 0, 0], type: 'standard' }];
	let axons = [];
	let pulses = [];
	let triggers = {};
	let mounted = false;

	export let reducedMotion = false;

	let axonId = 0;
	let pulseId = 0;

	let spawnTimer;
	let pulseTimer;
	let completeCall;

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

	const spawnPulse = () => {
		if (pulses.length >= maxPulses || axons.length === 0) return;

		const axon = axons[Math.floor(Math.random() * axons.length)];
		const reverse = Math.random() < 0.5;
		const from = neuronById(reverse ? axon.toId : axon.fromId)?.pos;
		const to = neuronById(reverse ? axon.fromId : axon.toId)?.pos;
		if (!from || !to) return;

		const curve = createCurve(from, to);
		const targetId = reverse ? axon.fromId : axon.toId;

		pulses = [
			...pulses,
			{
				id: pulseId++,
				curve,
				targetId,
				color: '#65f7ff',
				duration: 0.55 + Math.random() * 0.25
			}
		];
	};

	const onPulseArrive = (id, targetId) => {
		triggers = { ...triggers, [targetId]: (triggers[targetId] ?? 0) + 1 };
		pulses = pulses.filter((p) => p.id !== id);
	};

	const scheduleComplete = () => {
		completeCall?.kill?.();
		completeCall = gsap.delayedCall(0.9, () => onComplete());
	};

	onMount(() => {
		mounted = true;

		if (reducedMotion) {
			// Skip animation, complete immediately
			scheduleComplete();
			return;
		}

		spawnTimer = setInterval(() => {
			if (neurons.length >= targetCount) {
				clearInterval(spawnTimer);
				spawnTimer = null;
				scheduleComplete();
				return;
			}

			const prev = neurons;
			const id = prev.length;
			const next = { id, pos: randomSpherePoint(networkRadius), type: pickType() };
			neurons = [...prev, next];

			if (prev.length > 0) {
				const a = prev[Math.floor(Math.random() * prev.length)];
				addAxon(a.id, next.id);
			}
			if (prev.length > 2 && Math.random() < 0.35) {
				const b = prev[Math.floor(Math.random() * prev.length)];
				if (b.id !== id) addAxon(b.id, next.id);
			}
		}, 280);

		pulseTimer = setInterval(() => {
			spawnPulse();
		}, 380);
	});

	onDestroy(() => {
		if (spawnTimer) clearInterval(spawnTimer);
		if (pulseTimer) clearInterval(pulseTimer);
		completeCall?.kill?.();
	});
</script>

{#if mounted}
	<div class="network">
		<Canvas dpr={[1, 1.5]}>
			<T.PerspectiveCamera makeDefault position={[0, 0, 7]} fov={48} near={0.1} far={80} />
			<T.AmbientLight intensity={0.25} />
			<T.PointLight position={[3.5, 2.5, 6]} intensity={2.2} color="#65f7ff" />
			<T.PointLight position={[-4, -2, 6]} intensity={1.4} color="#6f6bff" />

			<NetworkGroup>
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
		</Canvas>
	</div>
{:else}
	<div class="network" />
{/if}

<style>
	.network {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.network :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
	}
</style>
