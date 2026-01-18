<script>
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let maxCount = 12;
	export let spawnMs = 520;
	export let refreshMs = 6200;

	const pool = [
		'&alpha;',
		'&beta;',
		'&gamma;',
		'&delta;',
		'&epsilon;',
		'&zeta;',
		'&eta;',
		'&theta;',
		'&lambda;',
		'&mu;',
		'&nu;',
		'&pi;',
		'&rho;',
		'&sigma;',
		'&tau;',
		'&phi;',
		'&psi;',
		'&omega;',
		'&Sigma;',
		'&Lambda;',
		'&Phi;',
		'&nabla;',
		'E = mc<sup>2</sup>',
		'a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>',
		'F = ma',
		'p = mv',
		'&int; f(x) dx',
		'&Sigma; x<sub>i</sub>',
		'&Delta;E &ge; 0',
		'P(A|B) = P(B|A)P(A)/P(B)',
		'e<sup>i&pi;</sup> + 1 = 0',
		'&part;f/&part;x',
		'sin(&theta;)/&theta;'
	];

	const rand = (min, max) => min + Math.random() * (max - min);
	const pick = (list) => list[Math.floor(Math.random() * list.length)];
	const isEquation = (content) => /[=<>/]|<sup>|<sub>|&int;|&Sigma;|&part;|&Delta;/.test(content);

	let items = [];
	let refreshTimer;
	let spawnTimer;
	let nextId = 0;

	const makeItem = (id, contentOverride) => {
		const content = contentOverride ?? pick(pool);
		const equation = isEquation(content);
		const size = equation ? rand(11, 18) : rand(14, 24);
		return {
			id,
			content,
			kind: equation ? 'equation' : 'symbol',
			x: rand(6, 94),
			y: rand(6, 94),
			dx: rand(-70, 70),
			dy: rand(-70, 70),
			rotate: rand(-16, 16),
			scale: rand(0.9, 1.2),
			opacity: rand(0.12, 0.42),
			blur: rand(0, 1.8),
			hue: rand(182, 210),
			drift: rand(12, 20),
			delay: rand(0, 1.2),
			size
		};
	};

	const updateItem = (item) => {
		return {
			...item,
			x: rand(6, 94),
			y: rand(6, 94),
			dx: rand(-70, 70),
			dy: rand(-70, 70),
			rotate: rand(-16, 16),
			scale: rand(0.9, 1.2),
			opacity: rand(0.12, 0.42),
			blur: rand(0, 1.8),
			hue: rand(182, 210),
			drift: rand(12, 20),
			delay: rand(0, 1.2)
		};
	};

	onMount(() => {
		if (!browser) return;
		items = [];
		nextId = 0;
		spawnTimer = setInterval(() => {
			if (items.length >= maxCount) return;
			const burst = Math.random() < 0.35 ? 2 : 1;
			for (let i = 0; i < burst; i += 1) {
				if (items.length >= maxCount) break;
				items = [...items, makeItem(nextId++)];
			}
		}, spawnMs);
		refreshTimer = setInterval(() => {
			if (!items.length) return;
			items = items.map(updateItem);
		}, refreshMs);
	});

	onDestroy(() => {
		if (refreshTimer) clearInterval(refreshTimer);
		if (spawnTimer) clearInterval(spawnTimer);
	});
</script>

<div class="field" aria-hidden="true">
	{#each items as item (item.id)}
		<div
			class="glyph {item.kind}"
			style="
				--x: {item.x}%;
				--y: {item.y}%;
				--dx: {item.dx}px;
				--dy: {item.dy}px;
				--rot: {item.rotate}deg;
				--scale: {item.scale};
				--alpha: {item.opacity};
				--blur: {item.blur}px;
				--hue: {item.hue};
				--drift: {item.drift}s;
				--delay: {item.delay}s;
				--size: {item.size}px;
			"
		>
			<span class="content">{@html item.content}</span>
		</div>
	{/each}
</div>

<style>
	.field {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
	}

	.glyph {
		position: absolute;
		left: var(--x);
		top: var(--y);
		opacity: var(--alpha);
		filter: blur(var(--blur));
		transform: translate(-50%, -50%) translate3d(var(--dx), var(--dy), 0) rotate(var(--rot))
			scale(var(--scale));
		transition:
			left var(--drift) ease-in-out,
			top var(--drift) ease-in-out,
			transform var(--drift) ease-in-out,
			opacity var(--drift) ease-in-out,
			filter var(--drift) ease-in-out;
		transition-delay: var(--delay);
		mix-blend-mode: screen;
	}

	.glyph .content {
		display: inline-block;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
		font-size: var(--size);
		letter-spacing: 0.18em;
		color: hsl(var(--hue) 95% 78%);
		text-shadow: 0 0 18px rgba(101, 247, 255, 0.35);
		white-space: nowrap;
	}

	.glyph.equation .content {
		letter-spacing: 0.08em;
		font-weight: 600;
	}

	.glyph.symbol .content {
		font-weight: 500;
	}

	@media (prefers-reduced-motion: reduce) {
		.glyph {
			transition: none;
			transform: translate(-50%, -50%);
			filter: none;
		}
	}
</style>
