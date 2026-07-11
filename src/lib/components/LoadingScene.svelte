<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { gsap } from 'gsap';
	import FloatingMath from './FloatingMath.svelte';
	import NeuralNetwork from './NeuralNetwork.svelte';

	export let targetCount = 12;

	const dispatch = createEventDispatcher();

	const bootLines = [
		'Initializing neural lattice…',
		'Growing synaptic mesh…',
		'Calibrating stethoscope cursor…',
		'Vitals stable — entering'
	];

	let overlay;
	let flash;
	let done = false;
	let tl;
	let watchdog;
	let lineTimer;
	let lineIndex = 0;
	let reducedMotion = false;
	let mountedAt = 0;
	let onVisibility;

	const finish = () => {
		if (done) return;
		done = true;

		clearTimeout(watchdog);
		clearInterval(lineTimer);
		lineIndex = bootLines.length - 1;

		tl?.kill();
		tl = gsap.timeline({
			onComplete: () => {
				dispatch('complete');
			}
		});

		if (reducedMotion) {
			tl.to(overlay, { autoAlpha: 0, duration: 0.1 });
			return;
		}

		// Defibrillator beat: a quick cyan flash, then the overlay collapses.
		tl.to(flash, { opacity: 0.85, duration: 0.09, ease: 'power2.in' })
			.to(flash, { opacity: 0, duration: 0.28, ease: 'power2.out' })
			.to(overlay, { autoAlpha: 0, duration: 0.55, ease: 'power3.inOut' }, '-=0.22');
	};

	onMount(() => {
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

		if (reducedMotion) {
			watchdog = setTimeout(finish, 100);
			return;
		}

		// setTimeout (not a GSAP/rAF timer) so the escape hatch fires even in
		// background tabs where requestAnimationFrame is throttled.
		mountedAt = performance.now();
		watchdog = setTimeout(finish, 4500);

		// Background tabs can throttle even setTimeout to minute granularity;
		// if the user refocuses after the deadline has passed, finish at once.
		onVisibility = () => {
			if (!document.hidden && performance.now() - mountedAt > 4500) finish();
		};
		document.addEventListener('visibilitychange', onVisibility);

		lineTimer = setInterval(() => {
			if (lineIndex < bootLines.length - 2) lineIndex += 1;
		}, 750);
	});

	onDestroy(() => {
		tl?.kill();
		clearTimeout(watchdog);
		clearInterval(lineTimer);
		if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
	});
</script>

<div bind:this={overlay} class="overlay" aria-hidden="true">
	<FloatingMath />
	<NeuralNetwork {targetCount} onComplete={finish} {reducedMotion} />

	<div class="hud">
		<div class="hud-title">Booting Synaptic Mesh</div>
		<div class="hud-subtitle">{bootLines[lineIndex]}<span class="hud-caret" /></div>
	</div>

	<svg class="ekg-strip" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true">
		<!-- static dim underlay gives the glow look without an animated
		     drop-shadow filter forcing per-frame re-rasterization -->
		<path
			class="ekg-underlay"
			d="M0 20 H90 L98 20 L103 14 L108 20 L130 20 L136 23 L142 2 L148 34 L154 20 L176 20 L186 16 L196 20 H290 L298 20 L303 14 L308 20 L330 20 L336 23 L342 2 L348 34 L354 20 L376 20 L386 16 L396 20 H490 L498 20 L503 14 L508 20 L530 20 L536 23 L542 2 L548 34 L554 20 L576 20 L586 16 L596 20 H600"
			fill="none"
			stroke="rgba(101, 247, 255, 0.14)"
			stroke-width="4"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			class="ekg-path"
			d="M0 20 H90 L98 20 L103 14 L108 20 L130 20 L136 23 L142 2 L148 34 L154 20 L176 20 L186 16 L196 20 H290 L298 20 L303 14 L308 20 L330 20 L336 23 L342 2 L348 34 L354 20 L376 20 L386 16 L396 20 H490 L498 20 L503 14 L508 20 L530 20 L536 23 L542 2 L548 34 L554 20 L576 20 L586 16 L596 20 H600"
			fill="none"
			stroke="#65f7ff"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>

	<div bind:this={flash} class="flash" />
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
		animation:
			overlay-in 0.25s ease-out,
			overlay-failsafe 0.6s ease 8.5s forwards;
	}

	@keyframes overlay-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Wall-clock backstop: even if every JS timer stalls, the overlay removes
	   itself — CSS animation timing is immune to background-tab rAF throttling. */
	@keyframes overlay-failsafe {
		to {
			opacity: 0;
			visibility: hidden;
		}
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

	.flash {
		position: absolute;
		inset: 0;
		z-index: 4;
		opacity: 0;
		background: radial-gradient(
			900px 600px at 50% 45%,
			rgba(157, 249, 255, 0.9),
			rgba(101, 247, 255, 0.35) 45%,
			transparent 75%
		);
		pointer-events: none;
	}

	.hud {
		position: absolute;
		left: 24px;
		bottom: 42px;
		z-index: 3;
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

	.hud-caret {
		display: inline-block;
		width: 7px;
		height: 12px;
		margin-left: 5px;
		vertical-align: -2px;
		background: rgba(101, 247, 255, 0.85);
		animation: caret-blink 0.9s steps(1) infinite;
	}

	@keyframes caret-blink {
		50% {
			opacity: 0;
		}
	}

	.ekg-strip {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 34px;
		z-index: 3;
		opacity: 0.55;
		pointer-events: none;
	}

	.ekg-path {
		stroke-dasharray: 90 1400;
		stroke-dashoffset: 90;
		animation: ekg-sweep 2.2s linear infinite;
	}

	@keyframes ekg-sweep {
		to {
			stroke-dashoffset: -1400;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hud-caret,
		.ekg-path {
			animation: none;
		}
	}
</style>
