<script>
	import { onDestroy, onMount } from 'svelte';
	import { T, useFrame } from '@threlte/core';
	import { gsap } from 'gsap';

	export let curve;
	export let duration = 0.6;
	export let color = '#65f7ff';
	export let onArrive = () => {};

	let mesh;
	const progress = { value: 0 };
	let tween;

	onMount(() => {
		tween = gsap.to(progress, {
			value: 1,
			duration,
			ease: 'power1.inOut',
			onComplete: onArrive
		});
	});

	useFrame(() => {
		if (!mesh || !curve) return;
		const p = curve.getPoint(progress.value);
		mesh.position.copy(p);
	});

	onDestroy(() => {
		tween?.kill();
	});
</script>

<T.Mesh bind:ref={mesh} frustumCulled={false}>
	<T.SphereGeometry args={[0.055, 16, 16]} />
	<T.MeshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} roughness={0.25} />
</T.Mesh>

