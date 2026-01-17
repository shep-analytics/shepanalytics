<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { gsap } from 'gsap';
	import NeuralNetwork from './NeuralNetwork.svelte';

	export let targetCount = 12;

	const dispatch = createEventDispatcher();

	let overlay;
	let done = false;
	let tl;
	let watchdog;
	let reducedMotion = false;

	const finish = () => {
		if (done) return;
		done = true;

		watchdog?.kill();

		tl?.kill();
		tl = gsap.timeline({
			defaults: { ease: 'power2.out' },
			onComplete: () => dispatch('complete')
		});
		tl.to(overlay, { autoAlpha: 0, duration: reducedMotion ? 0.1 : 0.9 });
	};

	onMount(() => {
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
		if (reducedMotion) {
			gsap.delayedCall(0.1, finish);
		} else {
			watchdog = gsap.delayedCall(6.5, finish);
		}
	});

	onDestroy(() => {
		tl?.kill();
		watchdog?.kill();
	});
</script>

<div bind:this={overlay} class="overlay" aria-hidden="true">
	<NeuralNetwork {targetCount} onComplete={finish} {reducedMotion} />

	<div class="hud">
		<div class="hud-title">Booting Synaptic Mesh</div>
		<div class="hud-subtitle">Calibrating stethoscope cursor…</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background:
			radial-gradient(1000px 500px at 50% 35%, rgba(101, 247, 255, 0.18), transparent 60%),
			radial-gradient(800px 450px at 40% 55%, rgba(111, 107, 255, 0.12), transparent 65%),
			linear-gradient(180deg, rgba(2, 7, 12, 1), rgba(0, 0, 0, 1));
		overflow: hidden;
	}

	.overlay::before {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.03),
			rgba(255, 255, 255, 0.03) 1px,
			transparent 2px,
			transparent 6px
		);
		opacity: 0.12;
		mix-blend-mode: overlay;
		pointer-events: none;
	}

	.hud {
		position: absolute;
		left: 24px;
		bottom: 22px;
		color: rgba(210, 255, 255, 0.9);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
		text-shadow: 0 0 16px rgba(101, 247, 255, 0.22);
		pointer-events: none;
	}

	.hud-title {
		letter-spacing: 0.08em;
		font-weight: 700;
		font-size: 12px;
		text-transform: uppercase;
	}

	.hud-subtitle {
		margin-top: 6px;
		opacity: 0.75;
		font-size: 12px;
	}
</style>
