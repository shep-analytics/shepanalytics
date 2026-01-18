<script>
	import { useThrelte } from '@threlte/core';
	import { onMount, tick } from 'svelte';
	import { get } from 'svelte/store';

	const ctx = useThrelte();
	
	// Log what useThrelte returns
	console.log('useThrelte context:', Object.keys(ctx));
	
	onMount(async () => {
		// Wait for next tick to ensure DOM is ready
		await tick();
		
		const forceResize = () => {
			console.log('RendererResize: forceResize called');
			console.log('RendererResize: ctx.renderer =', ctx.renderer);
			
			// The renderer might be a value or a store - try both
			let r = ctx.renderer;
			if (r && typeof r.subscribe === 'function') {
				// It's a store
				r = get(r);
				console.log('RendererResize: got from store =', r);
			}
			
			if (r && r.setSize) {
				const canvas = r.domElement;
				const parent = canvas?.parentElement;
				console.log('RendererResize: canvas =', canvas);
				console.log('RendererResize: parent =', parent);
				console.log('RendererResize: parent dims =', parent?.clientWidth, parent?.clientHeight);
				
				if (parent) {
					const width = parent.clientWidth || window.innerWidth;
					const height = parent.clientHeight || window.innerHeight;
					if (width > 0 && height > 0) {
						console.log('RendererResize: calling setSize with', width, height);
						r.setSize(width, height, false);
						
						// Update camera
						const camera = get(ctx.camera);
						if (camera) {
							camera.aspect = width / height;
							camera.updateProjectionMatrix();
							console.log('RendererResize: updated camera aspect to', camera.aspect);
						}

						ctx.invalidate?.();
					}
				}
			} else {
				console.log('RendererResize: renderer not available or no setSize method');
			}
		};

		// Try immediately
		forceResize();
		
		// Also try after delays for layout to settle
		const timeout1 = setTimeout(forceResize, 50);
		const timeout2 = setTimeout(forceResize, 150);
		const timeout3 = setTimeout(forceResize, 500);

		return () => {
			clearTimeout(timeout1);
			clearTimeout(timeout2);
			clearTimeout(timeout3);
		};
	});
</script>
