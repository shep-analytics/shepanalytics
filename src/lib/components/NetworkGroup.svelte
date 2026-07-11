<script>
	import { T, useFrame } from '@threlte/core';

	// Optional shared object the parent can read for the group's live rotation
	// (mutated in place each frame — not reactive by design).
	export let rotationState = null;

	let ref;

	useFrame((_, delta) => {
		if (!ref) return;
		ref.rotation.y += delta * 0.08;
		ref.rotation.x += delta * 0.04;
		if (rotationState) {
			rotationState.x = ref.rotation.x;
			rotationState.y = ref.rotation.y;
		}
	});
</script>

<T.Group bind:ref>
	<slot />
</T.Group>
