<script>
	import { onDestroy, onMount } from 'svelte';
	import { T, useFrame } from '@threlte/core';
	import { createMedicalTexture } from './EKGTexture';

	export let pos = [0, 0, 0];
	export let type = 'standard'; // 'standard' | 'ekg' | 'pulseox'
	export let trigger = 0;

	let mesh;
	let lastTrigger = trigger;
	const state = { flash: 0 };

	let medical = null;

	$: if (trigger !== lastTrigger) {
		lastTrigger = trigger;
		state.flash = 1;
	}

	onMount(() => {
		if (type === 'standard') return;
		medical = createMedicalTexture(type);
		if (medical) {
			medical.draw({ time: 0, spike: 0 });
		}
	});

	useFrame((_, delta) => {
		if (state.flash > 0) state.flash = Math.max(0, state.flash - delta * 2.4);

		if (mesh && type === 'standard') {
			const material = mesh.material;
			if (material && 'emissiveIntensity' in material) {
				material.emissiveIntensity = 1.2 + state.flash * 2.2;
			}
		}

		if (medical) {
			medical.draw({ time: performance.now() / 1000, spike: state.flash });
		}
	});

	onDestroy(() => {
		medical?.dispose();
		medical = null;
	});
</script>

<T.Group position={pos}>
	{#if type === 'standard'}
		<T.Mesh bind:ref={mesh}>
			<T.SphereGeometry args={[0.18, 24, 24]} />
			<T.MeshStandardMaterial
				color="#0b1220"
				emissive="#65f7ff"
				emissiveIntensity={1.2}
				roughness={0.25}
				metalness={0.08}
			/>
		</T.Mesh>
	{:else}
		<T.Mesh bind:ref={mesh}>
			<T.PlaneGeometry args={[0.62, 0.36]} />
			<T.MeshBasicMaterial map={medical?.texture} transparent opacity={0.98} toneMapped={false} />
		</T.Mesh>
	{/if}
</T.Group>
