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

## How to work here (the loop)

1. **Understand first.** Read the relevant components before touching anything.
   Fan out read-only `Explore` agents for anything spanning multiple
   files/components rather than reading them serially yourself.
2. **Verify against the real thing.** Run `npm run build` (and `npm run
   preview` for anything visual) before declaring a change done — this is a
   prerendered static site, so build-time errors are the failure mode.
3. **Self-review non-trivial changes.** Run `/code-review`, or a multi-agent
   review Workflow (find → independently verify each finding → fix →
   re-judge), and loop until a round is clean.

## Orchestration — you are the orchestrator

Plan, decompose, synthesize; keep your own context lean by delegating.

**Delegation is the default, every session — not an option.** Before any
non-trivial design/architecture/debugging call, spawn **deep-reasoner**. For any
well-specified, multi-file, or repetitive change, spawn
**mechanical-task-executor** rather than editing inline — inline is the
exception and needs a reason. Launch independent agents in parallel (one
message, multiple calls; background where sensible). Background agents are
invisible to the user: **always say in your reply which agents you launched and
what each one did.**

- **deep-reasoner** → architecture/design decisions, hard/intermittent debugging
  (Three.js disposal leaks, animation timing races), tradeoff analysis. Reason
  before acting.
- **mechanical-task-executor** → boilerplate, renames, repetitive edits,
  content updates (resume entries, portfolio items), any well-specified
  mechanical change.
- **Explore** → read-only fan-out search across components, routes, and
  `static/assets/`.
- **Plan** → implementation strategy for a scoped task before writing code.
- **codex:rescue** (`/codex:rescue`) → a peer engineer for a second
  implementation or diagnosis pass. Treat as a peer, not a reviewer. For
  high-stakes calls, run Opus + Codex on the same problem in parallel and
  synthesize the best of both.

(`deep-reasoner` and `mechanical-task-executor` are user-level agents in
`~/.claude/agents/` — available here without any repo-local setup.)

## Picking the right models for workflows and subagents

Rankings, higher = better. Cost reflects what I actually pay, not list price.
Intelligence is how hard a problem you can hand the model unsupervised. Taste
covers UI/UX, code quality, API design, and copy.

| model        | cost | intelligence | taste |
|--------------|------|--------------|-------|
| gpt-5.6-sol  | 4    | 9            | 6     |
| sonnet       | 5    | 5            | 7     |
| opus-4.8     | 4    | 7            | 8     |
| fable-5      | 2    | 9            | 9     |

Claude rows use the Agent/Workflow **aliases** (`sonnet` / `opus` / `fable`),
which always resolve to the newest model of that tier — when a newer
Sonnet/Opus ships, this file needs no edit. The OpenAI row is **gpt-5.6-sol**
(Codex 5.6 Sol): fable-level intelligence at opus-level cost — the best
intelligence-per-dollar for hard problems.

How to apply:
- These are defaults, not limits. You have standing permission to override
  them: if a cheaper model's output doesn't meet the bar, rerun or redo the
  work with a smarter model without asking. Judge the output, not the price
  tag. Escalating costs less than shipping mediocre work.
- Cost is a tie-breaker only; when axes conflict for anything that ships,
  intelligence > taste > cost.
- Hard reasoning, second opinions, and big clear-spec implementation:
  gpt-5.6-sol — you get fable-tier intelligence without fable-tier cost.
- Bulk/mechanical work (renames, content edits, simple test updates): sonnet.
- Anything user-facing (UI, copy, visual design) needs taste ≥ 7 — this is a
  portfolio site, so most shipped changes are user-facing.
- Reviews of plans/implementations: opus-4.8, optionally gpt-5.6-sol as an
  extra independent perspective.
- Never use Haiku.
- **Never run subagents or Workflow `agent()` calls on `fable`** (user
  directive, 2026-07-02 — fable is the most expensive tier). When the main
  session itself runs on Fable 5, an omitted `model` **inherits fable**, so
  always pass an explicit `model` on every Agent and Workflow `agent()` call.
  The "escalate without asking" permission above caps at `opus` for agents.
- Mechanics: gpt-5.6-sol is only reachable through the Codex CLI — `codex
  exec` / `codex review` (`~/.codex/config.toml` already defaults to
  gpt-5.6-sol). Use the codex plugin skills (`/codex:rescue`; prompt-writing
  guidance in `codex:gpt-5-4-prompting`); for work they don't cover
  (investigation, data analysis), run `codex exec -s read-only` directly with
  a self-contained prompt.
- Claude models run via the Agent/Workflow `model` parameter (`sonnet` /
  `opus` / `fable`; Workflow `agent()` also takes `effort`).

Using gpt-5.6-sol inside workflows and subagents (the model parameter only
takes Claude models, so use a wrapper):
- Spawn a thin Claude wrapper agent with `model: 'sonnet', effort: 'low'` whose
  prompt instructs it to write a self-contained codex prompt, run `codex exec`
  via Bash, and return Codex's output verbatim.

Mapping onto the named agents above: **mechanical-task-executor** → `sonnet`
(or gpt-5.6-sol via the Codex wrapper for big clear-spec batches);
**deep-reasoner** → `opus` (user's standing choice — do not bump to fable),
with gpt-5.6-sol via codex as a parallel second opinion on the hardest calls;
review/judge passes → `opus`; **Explore** fan-outs → `sonnet` (don't omit
`model` — inheriting a Fable 5 session's default runs the agent on fable).
