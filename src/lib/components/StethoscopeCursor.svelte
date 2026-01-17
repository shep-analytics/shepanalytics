<script>
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let enabled = true;
	export let tailLength = 300; // Fixed tail length in pixels
	export let qrsPeriod = 1500; // QRS complex every 1.5 seconds (slower)
	export let numPoints = 150; // High point count for smooth QRS rendering

	let viewportWidth = 1;
	let viewportHeight = 1;

	let mouseX = 0;
	let mouseY = 0;
	
	// Track movement direction (smoothed)
	let dirX = -1; // Default: pointing left
	let dirY = 0;
	const smoothing = 0.15; // How quickly direction updates (lower = smoother)

	// EKG waveform: P wave, QRS complex, T wave (tightened timing)
	// Values represent vertical offset multipliers
	const ekgWaveform = [
		{ t: 0.0, y: 0 }, // baseline
		{ t: 0.05, y: 0 }, // baseline
		{ t: 0.08, y: 0.1 }, // P wave peak
		{ t: 0.11, y: 0 }, // end P wave
		{ t: 0.13, y: 0 }, // PR segment
		{ t: 0.14, y: -0.15 }, // Q wave
		{ t: 0.16, y: 1.0 }, // R wave peak
		{ t: 0.18, y: -0.3 }, // S wave
		{ t: 0.20, y: 0 }, // end QRS
		{ t: 0.30, y: 0.18 }, // T wave peak
		{ t: 0.38, y: 0 }, // end T wave
		{ t: 1.0, y: 0 } // baseline to next beat
	];

	// Interpolate EKG waveform value at a given phase (0-1)
	// Returns 0 for phases outside 0-1 to ensure only ONE QRS is visible at a time
	const ekgAt = (phase) => {
		// Only show waveform for phase 0 to 1 - no wrapping/repeating
		if (phase < 0 || phase > 1) return 0;
		
		for (let i = 0; i < ekgWaveform.length - 1; i++) {
			const a = ekgWaveform[i];
			const b = ekgWaveform[i + 1];
			if (phase >= a.t && phase <= b.t) {
				const lerp = (phase - a.t) / Math.max(0.001, b.t - a.t);
				return a.y + (b.y - a.y) * lerp;
			}
		}
		return 0;
	};

	const updatePosition = (x, y) => {
		// Calculate movement delta
		const dx = x - mouseX;
		const dy = y - mouseY;
		const len = Math.sqrt(dx * dx + dy * dy);
		
		// Only update direction if there's meaningful movement
		if (len > 2) {
			// Normalize the movement direction
			const newDirX = dx / len;
			const newDirY = dy / len;
			
			// Smooth the direction to avoid jitter
			dirX = dirX + (newDirX - dirX) * smoothing;
			dirY = dirY + (newDirY - dirY) * smoothing;
			
			// Re-normalize
			const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
			if (dirLen > 0.01) {
				dirX /= dirLen;
				dirY /= dirLen;
			}
		}
		
		mouseX = x;
		mouseY = y;
	};

	// Generate fixed-length tail points extending behind the cursor
	// The tail always extends in the opposite direction of movement
	const generateTailPoints = () => {
		const points = [];
		const spacing = tailLength / (numPoints - 1);
		
		for (let i = 0; i < numPoints; i++) {
			// Distance from cursor (0 = at cursor, tailLength = end of tail)
			const dist = i * spacing;
			
			// Tail extends opposite to movement direction
			points.push({
				x: mouseX - dirX * dist,
				y: mouseY - dirY * dist
			});
		}
		
		return points;
	};

	// Amplitude for the EKG waveform
	const amplitude = 22;

	// Current time for animation - triggers reactivity
	let now = 0;

	// Compute polyline with traveling EKG waveform
	// The QRS complex travels along the trail, away from the cursor toward the tail
	$: polyline = (() => {
		const displayPoints = generateTailPoints();
		if (displayPoints.length === 0) return '';

		const pointCount = displayPoints.length;

		// Time phase: 0 to 1 over qrsPeriod, this is when the QRS "fires"
		const timePhase = (now % qrsPeriod) / qrsPeriod;

		// Calculate perpendicular direction (90 degrees from tail direction)
		// Tail goes in direction (dirX, dirY), perpendicular is (-dirY, dirX)
		const perpX = -dirY;
		const perpY = dirX;

		return displayPoints
			.map((p, i) => {
				// Position along trail: 0 = at cursor, 1 = end of tail
				const positionAlongTrail = i / Math.max(1, pointCount - 1);

				// The wave should travel FROM cursor TOWARD the tail end (away from cursor)
				const phase = positionAlongTrail - timePhase;

				const offset = ekgAt(phase) * amplitude;
				
				// Apply offset perpendicular to the tail direction
				return `${(p.x + perpX * offset).toFixed(1)},${(p.y + perpY * offset).toFixed(1)}`;
			})
			.join(' ');
	})();

	let start = { x: 0, y: 0 };
	$: {
		const displayPoints = generateTailPoints();
		start = displayPoints[displayPoints.length - 1] ?? { x: mouseX, y: mouseY };
	}

	let onMove;
	let onResize;
	let animationFrame;

	// Animation loop to update the EKG waveform continuously
	const animate = () => {
		now = performance.now();
		// Trigger reactivity by reassigning direction (causes polyline recalc)
		dirX = dirX;
		animationFrame = requestAnimationFrame(animate);
	};

	onMount(() => {
		if (!browser) return;

		const setSize = () => {
			viewportWidth = Math.max(1, window.innerWidth);
			viewportHeight = Math.max(1, window.innerHeight);
		};
		setSize();

		// Initialize cursor position to center so stethoscope is visible immediately
		mouseX = viewportWidth / 2;
		mouseY = viewportHeight / 2;

		onResize = () => setSize();
		window.addEventListener('resize', onResize, { passive: true });

		onMove = (e) => {
			if (!enabled) return;
			updatePosition(e.clientX, e.clientY);
		};
		window.addEventListener('mousemove', onMove, { passive: true });

		// Start animation loop
		animationFrame = requestAnimationFrame(animate);
	});

	$: if (browser) {
		const cls = 'stethoscope-cursor';
		if (enabled) document.body.classList.add(cls);
		else document.body.classList.remove(cls);
	}

	onDestroy(() => {
		if (!browser) return;
		if (onMove) window.removeEventListener('mousemove', onMove);
		if (onResize) window.removeEventListener('resize', onResize);
		if (animationFrame) cancelAnimationFrame(animationFrame);
		document.body.classList.remove('stethoscope-cursor');
	});
</script>

<svg
	class:enabled
	class="overlay"
	viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
	preserveAspectRatio="none"
	aria-hidden="true"
>
	<defs>
		<linearGradient
			id="ekgGradient"
			gradientUnits="userSpaceOnUse"
			x1={start.x}
			y1={start.y}
			x2={mouseX}
			y2={mouseY}
		>
			<stop offset="0%" stop-color="#65f7ff" stop-opacity="0.15" />
			<stop offset="40%" stop-color="#65f7ff" stop-opacity="0.35" />
			<stop offset="100%" stop-color="#65f7ff" stop-opacity="0.9" />
		</linearGradient>
	</defs>

	<polyline
		points={polyline}
		fill="none"
		stroke="url(#ekgGradient)"
		stroke-width="2.25"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>

	<g transform={`translate(${mouseX} ${mouseY})`} opacity={enabled ? 1 : 0}>
		<!-- small heart shape -->
		<path
			d="M 0 3 C -1.5 0, -5 0, -5 -3 C -5 -6, -2.5 -7, 0 -4.5 C 2.5 -7, 5 -6, 5 -3 C 5 0, 1.5 0, 0 3 Z"
			fill="#65f7ff"
			stroke="#65f7ff"
			stroke-width="1"
			opacity="0.9"
		/>
	</g>
</svg>

<style>
	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		filter: drop-shadow(0 0 12px rgba(101, 247, 255, 0.25));
	}

	:global(body.stethoscope-cursor) {
		cursor: none;
	}
</style>
