<script>
	import { T } from '@threlte/core';

	export let curve;
	export let radius = 0.03;
	export let color = '#3ad7ff';
</script>

<T.Mesh frustumCulled={false}>
	<T.TubeGeometry args={[curve, 64, radius, 8, false]} />
	<T.MeshStandardMaterial
		color={color}
		emissive={color}
		emissiveIntensity={1.1}
		transparent
		opacity={0.25}
		roughness={0.35}
		metalness={0.0}
	/>
</T.Mesh>

