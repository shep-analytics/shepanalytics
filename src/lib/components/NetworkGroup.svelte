<script>
	import { T, useFrame } from '@threlte/core';

	let ref;

	useFrame((_, delta) => {
		if (!ref) return;
		ref.rotation.y += delta * 0.08;
		ref.rotation.x += delta * 0.04;
	});
</script>

<T.Group bind:ref>
	<slot />
</T.Group>
