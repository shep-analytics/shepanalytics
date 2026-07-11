<script>
	import { onMount, tick } from 'svelte';
	import LoadingScene from '$lib/components/LoadingScene.svelte';
	import StethoscopeCursor from '$lib/components/StethoscopeCursor.svelte';

	let isReady = false;
	let showBoot = false;
	let cursorEnabled = true;
	let aosRefreshed = false;

	const forceAOSVisible = () => {
		// Fallback: force all AOS elements to be visible
		const aosElements = document.querySelectorAll('[data-aos]');
		aosElements.forEach((el) => {
			el.classList.add('aos-animate');
		});
	};

	const refreshAOS = async () => {
		if (typeof window === 'undefined') return;

		await tick();
		await new Promise((r) => requestAnimationFrame(r));

		const AOS = window.AOS;
		if (!AOS) {
			// AOS not loaded yet, force visibility as fallback
			forceAOSVisible();
			return;
		}

		// Reinitialize AOS with same settings
		AOS.init?.({
			duration: 1000,
			easing: 'ease-in-out',
			once: true,
			mirror: false
		});

		// Force recalculation
		AOS.refreshHard?.();

		// Small delay then refresh again
		await new Promise((r) => setTimeout(r, 100));
		AOS.refresh?.();

		// Trigger scroll event to animate elements in viewport
		window.dispatchEvent(new Event('scroll'));
	};

	const queueAOSRefresh = () => {
		if (aosRefreshed) return;
		aosRefreshed = true;

		let attempts = 0;
		const maxAttempts = 20;
		const interval = 150;

		const kick = async () => {
			attempts += 1;

			if (typeof window !== 'undefined' && window.AOS) {
				await refreshAOS();
				return;
			}

			if (attempts < maxAttempts) {
				setTimeout(kick, interval);
			} else {
				// Final fallback: force all AOS elements visible
				forceAOSVisible();
			}
		};

		kick();
	};

	$: if (isReady) {
		queueAOSRefresh();
	}

	onMount(() => {
		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
		if (reduceMotion) cursorEnabled = false;

		// Boot sequence plays only on the home route, once per session.
		// Deep links (e.g. /resume shared with a journalist) go straight to content.
		let seen = false;
		try {
			seen = sessionStorage.getItem('synaptic-booted') === '1';
		} catch (e) {
			seen = false;
		}
		const isHome = window.location.pathname === '/';

		if (isHome && !seen) {
			showBoot = true;
			try {
				sessionStorage.setItem('synaptic-booted', '1');
			} catch (e) {
				/* storage unavailable — boot will simply replay */
			}
		} else {
			isReady = true;
		}
	});
</script>

{#if showBoot && !isReady}
	<LoadingScene on:complete={() => (isReady = true)} />
{/if}

<noscript>
	<style>
		.app-shell {
			opacity: 1 !important;
			pointer-events: auto !important;
		}
	</style>
</noscript>

<div class="cursor-layer">
	<StethoscopeCursor enabled={cursorEnabled} />
</div>

<div class:ready={isReady} class:preloaded={showBoot} class="app-shell">
	<slot />
</div>

<style>
	.cursor-layer {
		position: fixed;
		inset: 0;
		z-index: 10000;
		pointer-events: none;
	}

	.app-shell {
		opacity: 0;
		pointer-events: none;
		transition: opacity 800ms ease;
		/* Wall-clock failsafe: CSS animations are unaffected by rAF throttling in
		   background tabs, so content becomes visible even if JS never flips isReady. */
		animation: shell-failsafe 0.8s ease 9s forwards;
	}

	/* While the boot overlay (opaque, z-9999) is up, keep the content beneath it
	   fully painted — the overlay then fades directly into rendered content with
	   no white crossfade mixing. */
	.app-shell.preloaded {
		opacity: 1;
	}

	.app-shell.ready {
		opacity: 1;
		pointer-events: auto;
		animation: none;
	}

	@keyframes shell-failsafe {
		to {
			opacity: 1;
			pointer-events: auto;
		}
	}

	/* Ensure AOS elements are visible when app is ready, even if AOS fails */
	.app-shell.ready :global([data-aos]:not(.aos-animate)) {
		opacity: 1;
		transform: translateY(0) translateX(0) scale(1);
	}
</style>
