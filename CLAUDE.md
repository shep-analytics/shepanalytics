# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**shepanalytics** is a personal portfolio website for Alex Sheppert (DO, PhD, MBA) built with SvelteKit and Three.js. It features a medical/scientific theme with custom 3D neural network animations and an EKG-style stethoscope cursor.

## Tech Stack

- **Framework**: SvelteKit 2.4.3 with Svelte 4
- **Build Tool**: Vite 5
- **3D Graphics**: Three.js 0.160 via Threlte (Svelte wrapper)
- **Animation**: GSAP 3.12
- **Styling**: Bootstrap 5 (CDN) + custom CSS
- **Deployment**: Vercel (static adapter)

## Common Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (localhost:5173)
npm run build      # Build to /dist
npm run preview    # Preview production build
```

## Project Structure

```
src/
├── app.html                    # HTML shell (loads vendor CDN scripts)
├── lib/components/             # Reusable Svelte components
│   ├── NeuralNetwork.svelte    # Main 3D neural network visualization
│   ├── LoadingScene.svelte     # Loading screen with 3D animation
│   ├── StethoscopeCursor.svelte # Custom cursor with EKG trail
│   ├── EKGTexture.ts           # Canvas texture generator for medical waveforms
│   ├── Neuron.svelte           # Individual 3D neuron mesh
│   ├── Axon.svelte             # Neural connection lines
│   └── Pulse.svelte            # Animated pulse along curves
└── routes/
    ├── +layout.svelte          # Root layout (loading screen, cursor)
    ├── +layout.js              # Config: prerender=true, trailingSlash='never'
    ├── +page.svelte            # Home page (main portfolio)
    ├── inner-page/             # Additional content page template
    └── portfolio-details/      # Portfolio item detail template

static/
├── assets/
│   ├── css/style.css           # Main stylesheet
│   ├── js/main.js              # Vanilla JS utilities
│   ├── img/                    # Images (headshot, portfolio, etc.)
│   └── vendor/                 # Third-party libraries (AOS, Swiper, etc.)
└── forms/contact.php           # Contact form handler
```

## Architecture Notes

### Static Site Generation
All pages are pre-rendered at build time via `@sveltejs/adapter-static`. Output goes to `/dist` for Vercel deployment.

### 3D Components (Threlte)
The neural network visualization uses Threlte Canvas. Key components:
- `NeuralNetwork.svelte` - Manages neurons, axons, and pulses
- `EKGTexture.ts` - Generates animated EKG/pulse-ox waveform textures
- Components properly dispose Three.js resources to prevent memory leaks

### Loading Flow
1. `+layout.svelte` shows `LoadingScene` on mount
2. 3D animation plays with "Booting Synaptic Mesh" HUD
3. After animation (or 6.5s watchdog), content fades in
4. `StethoscopeCursor` tracks mouse with EKG trail effect

### Accessibility
- Respects `prefers-reduced-motion` to disable animations
- AOS (Animate On Scroll) has fallback visibility
- Mobile-optimized cursor with tap effects

## Key Files to Know

- `src/routes/+page.svelte` - Main portfolio content (hero, about, skills, resume, contact)
- `src/lib/components/StethoscopeCursor.svelte` - Custom animated cursor
- `static/assets/css/style.css` - Primary stylesheet
- `static/assets/js/main.js` - Bootstrap/vendor initialization

## Vendor Libraries (loaded via CDN in app.html)

- AOS - Scroll animations
- Glightbox - Image lightbox
- Swiper - Carousels
- Typed.js - Typewriter effect
- Isotope - Portfolio filtering
- Pure Counter - Number animations

## Coding Conventions

- Svelte components use TypeScript where beneficial (`<script lang="ts">`)
- Three.js objects must be properly disposed in `onDestroy`
- CSS uses Bootstrap utilities where possible, custom styles in style.css
- Animation timing uses GSAP timelines for complex sequences
