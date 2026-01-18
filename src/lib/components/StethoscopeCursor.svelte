<script>
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let enabled = true;
	export let maxTrailLength = 300; // Maximum trail length in pixels
	export let qrsPeriod = 1500; // QRS complex every 1.5 seconds
	export let fadeDelay = 1500; // Time before trail starts retracting (ms)
	export let retractDuration = 2000; // How long the retraction takes (ms) - slower for smooth effect

	let viewportWidth = 1;
	let viewportHeight = 1;

	let mouseX = 0;
	let mouseY = 0;
	
	// Store actual path points
	let pathPoints = [];
	let lastMoveTime = 0;
	let retractStartTime = 0;
	let retractStartLength = 0;
	let isRetracting = false;
	let visibleLength = 0; // Current visible trail length for smooth retraction

	// EKG waveform: P wave, QRS complex, T wave (tightened timing)
	const ekgWaveform = [
		{ t: 0.0, y: 0 },
		{ t: 0.05, y: 0 },
		{ t: 0.08, y: 0.1 },
		{ t: 0.11, y: 0 },
		{ t: 0.13, y: 0 },
		{ t: 0.14, y: -0.15 },
		{ t: 0.16, y: 1.0 },
		{ t: 0.18, y: -0.3 },
		{ t: 0.20, y: 0 },
		{ t: 0.30, y: 0.18 },
		{ t: 0.38, y: 0 },
		{ t: 1.0, y: 0 }
	];

	// Interpolate EKG waveform value at a given phase (0-1)
	const ekgAt = (phase) => {
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

	// Calculate total path length
	const getPathLength = (points) => {
		let length = 0;
		for (let i = 1; i < points.length; i++) {
			const dx = points[i].x - points[i-1].x;
			const dy = points[i].y - points[i-1].y;
			length += Math.sqrt(dx * dx + dy * dy);
		}
		return length;
	};

	// Trim path to maximum length, keeping newest points (trims from tail)
	const trimPath = (points, maxLength) => {
		if (points.length < 2) return points;
		
		let totalLength = 0;
		let cutIndex = 0;
		
		// Calculate from newest to oldest
		for (let i = points.length - 1; i > 0; i--) {
			const dx = points[i].x - points[i-1].x;
			const dy = points[i].y - points[i-1].y;
			totalLength += Math.sqrt(dx * dx + dy * dy);
			
			if (totalLength > maxLength) {
				cutIndex = i;
				break;
			}
		}
		
		return points.slice(cutIndex);
	};

	// Trim path from the start (oldest points), keeping newest - used for retraction
	const trimPathFromEnd = (points, targetLength) => {
		if (points.length < 2) return [];
		
		let totalLength = 0;
		
		// Calculate from newest to oldest, keeping points until we reach targetLength
		for (let i = points.length - 1; i > 0; i--) {
			const dx = points[i].x - points[i-1].x;
			const dy = points[i].y - points[i-1].y;
			totalLength += Math.sqrt(dx * dx + dy * dy);
			
			if (totalLength >= targetLength) {
				// Interpolate the cut point for smooth retraction
				const overshoot = totalLength - targetLength;
				const segLen = Math.sqrt(dx * dx + dy * dy);
				const t = overshoot / segLen;
				
				const interpPoint = {
					x: points[i].x + (points[i-1].x - points[i].x) * t,
					y: points[i].y + (points[i-1].y - points[i].y) * t
				};
				
				return [interpPoint, ...points.slice(i)];
			}
		}
		
		return points;
	};

	const addPoint = (x, y) => {
		mouseX = x;
		mouseY = y;
		lastMoveTime = performance.now();
		isRetracting = false;
		visibleLength = maxTrailLength; // Reset to full visibility when moving
		
		// Only add point if it's far enough from the last one
		if (pathPoints.length > 0) {
			const last = pathPoints[pathPoints.length - 1];
			const dx = x - last.x;
			const dy = y - last.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			
			// Minimum 2px between points for smooth path
			if (dist < 2) return;
		}
		
		pathPoints = [...pathPoints, { x, y }];
		pathPoints = trimPath(pathPoints, maxTrailLength);
	};

	// Resample path to fixed number of points for smooth EKG
	const resamplePath = (points, numSamples) => {
		if (points.length < 2) return points;
		
		const totalLength = getPathLength(points);
		if (totalLength < 1) return points;
		
		const result = [];
		const segmentLength = totalLength / (numSamples - 1);
		
		let currentDist = 0;
		let pointIndex = 0;
		let segmentDist = 0;
		
		result.push({ ...points[0] });
		
		for (let i = 1; i < numSamples - 1; i++) {
			const targetDist = i * segmentLength;
			
			while (pointIndex < points.length - 1) {
				const dx = points[pointIndex + 1].x - points[pointIndex].x;
				const dy = points[pointIndex + 1].y - points[pointIndex].y;
				const segLen = Math.sqrt(dx * dx + dy * dy);
				
				if (currentDist + segLen >= targetDist) {
					const t = (targetDist - currentDist) / segLen;
					result.push({
						x: points[pointIndex].x + dx * t,
						y: points[pointIndex].y + dy * t
					});
					break;
				}
				
				currentDist += segLen;
				pointIndex++;
			}
		}
		
		result.push({ ...points[points.length - 1] });
		return result;
	};

	// Amplitude for the EKG waveform
	const amplitude = 22;
	const numRenderPoints = 150;

	// Current time for animation
	let now = 0;

	// Compute polyline with traveling EKG waveform
	$: polyline = (() => {
		if (pathPoints.length < 2) return '';
		
		const displayPoints = resamplePath(pathPoints, numRenderPoints);
		if (displayPoints.length < 2) return '';

		const pointCount = displayPoints.length;
		const timePhase = (now % qrsPeriod) / qrsPeriod;

		// Pre-compute smoothed perpendicular directions to avoid jitter
		// Average direction across multiple neighboring segments
		const perpDirs = displayPoints.map((p, i) => {
			let totalDx = 0, totalDy = 0;
			let count = 0;
			
			// Look at several neighboring segments for smoother direction
			const lookAhead = 3;
			for (let j = Math.max(0, i - lookAhead); j < Math.min(pointCount - 1, i + lookAhead); j++) {
				const dx = displayPoints[j + 1].x - displayPoints[j].x;
				const dy = displayPoints[j + 1].y - displayPoints[j].y;
				const len = Math.sqrt(dx * dx + dy * dy);
				if (len > 0.01) {
					totalDx += dx / len;
					totalDy += dy / len;
					count++;
				}
			}
			
			if (count > 0) {
				const avgDx = totalDx / count;
				const avgDy = totalDy / count;
				const avgLen = Math.sqrt(avgDx * avgDx + avgDy * avgDy);
				if (avgLen > 0.01) {
					// Perpendicular to averaged direction
					return { x: -avgDy / avgLen, y: avgDx / avgLen };
				}
			}
			
			return { x: 0, y: 1 }; // default
		});

		// Calculate cumulative distance from cursor (end of trail) for each point
		const distances = [0];
		for (let i = displayPoints.length - 2; i >= 0; i--) {
			const dx = displayPoints[i].x - displayPoints[i + 1].x;
			const dy = displayPoints[i].y - displayPoints[i + 1].y;
			distances.unshift(distances[0] + Math.sqrt(dx * dx + dy * dy));
		}
		const totalDist = distances[0];

		// Filter points to only include those within visibleLength from cursor
		// distances[i] = distance from point i to cursor (0 at cursor, larger at tail)
		const visiblePoints = [];
		const visiblePerpDirs = [];
		const visibleDistFromCursor = [];
		
		for (let i = 0; i < displayPoints.length; i++) {
			// Keep points whose distance from cursor is within visibleLength
			if (distances[i] <= visibleLength) {
				visiblePoints.push(displayPoints[i]);
				visiblePerpDirs.push(perpDirs[i]);
				visibleDistFromCursor.push(distances[i]);
			}
		}
		
		if (visiblePoints.length < 2) return '';

		return visiblePoints
			.map((p, i) => {
				const perpX = visiblePerpDirs[i].x;
				const perpY = visiblePerpDirs[i].y;

				// Use absolute distance from cursor, normalized by max trail length
				const positionAlongTrail = visibleDistFromCursor[i] / maxTrailLength;

				// Wave travels from cursor toward tail
				const phase = positionAlongTrail - timePhase;

				const offset = ekgAt(phase) * amplitude;
				
				return `${(p.x + perpX * offset).toFixed(1)},${(p.y + perpY * offset).toFixed(1)}`;
			})
			.join(' ');
	})();

	$: start = pathPoints.length > 0 ? pathPoints[0] : { x: mouseX, y: mouseY };

	let onMove;
	let onResize;
	let animationFrame;

	// Animation loop
	const animate = () => {
		now = performance.now();
		
		// Handle retraction after inactivity
		const timeSinceMove = now - lastMoveTime;
		if (timeSinceMove > fadeDelay && pathPoints.length > 0) {
			// Start retraction if not already retracting
			if (!isRetracting) {
				isRetracting = true;
				retractStartTime = now;
				retractStartLength = getPathLength(pathPoints);
			}
			
			// Calculate how much to retract with ease-out for smooth deceleration
			const linearProgress = Math.min(1, (now - retractStartTime) / retractDuration);
			// Ease-out: starts fast, slows down at the end
			const retractProgress = 1 - Math.pow(1 - linearProgress, 2);
			
			// Update visibleLength for smooth rendering
			visibleLength = retractStartLength * (1 - retractProgress);
			
			// Clear path data when fully retracted
			if (visibleLength < 1) {
				pathPoints = [];
				isRetracting = false;
				visibleLength = 0;
			}
		}
		
		// Trigger reactivity
		visibleLength = visibleLength;
		animationFrame = requestAnimationFrame(animate);
	};

	onMount(() => {
		if (!browser) return;

		const setSize = () => {
			viewportWidth = Math.max(1, window.innerWidth);
			viewportHeight = Math.max(1, window.innerHeight);
		};
		setSize();

		mouseX = viewportWidth / 2;
		mouseY = viewportHeight / 2;
		lastMoveTime = performance.now();

		onResize = () => setSize();
		window.addEventListener('resize', onResize, { passive: true });

		onMove = (e) => {
			if (!enabled) return;
			addPoint(e.clientX, e.clientY);
		};
		window.addEventListener('mousemove', onMove, { passive: true });

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
		transition: opacity 0.3s ease-out;
	}

	:global(body.stethoscope-cursor) {
		cursor: none;
	}
</style>
