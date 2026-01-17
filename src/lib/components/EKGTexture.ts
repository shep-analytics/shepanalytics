import * as THREE from 'three';

export type MedicalTextureKind = 'ekg' | 'pulseox';

type CreateMedicalTextureOptions = {
	width?: number;
	height?: number;
	color?: string;
};

export type MedicalTexture = {
	texture: THREE.CanvasTexture;
	draw: (params: { time: number; spike?: number }) => void;
	dispose: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const ekgPoints = [
	{ t: 0.0, y: 0.0 },
	{ t: 0.1, y: 0.0 },
	{ t: 0.16, y: 0.12 }, // P
	{ t: 0.22, y: 0.0 },
	{ t: 0.3, y: -0.18 }, // Q
	{ t: 0.325, y: 1.0 }, // R
	{ t: 0.35, y: -0.45 }, // S
	{ t: 0.42, y: 0.0 },
	{ t: 0.62, y: 0.22 }, // T
	{ t: 0.78, y: 0.0 },
	{ t: 1.0, y: 0.0 }
];

function ekgAt(phase: number) {
	const t = phase - Math.floor(phase);
	for (let i = 0; i < ekgPoints.length - 1; i++) {
		const a = ekgPoints[i];
		const b = ekgPoints[i + 1];
		if (t >= a.t && t <= b.t) {
			const tt = (t - a.t) / Math.max(1e-6, b.t - a.t);
			return lerp(a.y, b.y, tt);
		}
	}
	return 0;
}

export function createMedicalTexture(kind: MedicalTextureKind, options: CreateMedicalTextureOptions = {}): MedicalTexture | null {
	// Guard against SSR - document not available on server
	if (typeof document === 'undefined') {
		return null;
	}

	const width = options.width ?? 256;
	const height = options.height ?? 128;
	const stroke = options.color ?? '#65f7ff';

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2D canvas context unavailable');

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	const draw = ({ time, spike = 0 }: { time: number; spike?: number }) => {
		const w = width;
		const h = height;
		const cx = w / 2;
		const cy = h / 2;

		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = 'rgba(3, 8, 14, 0.85)';
		ctx.fillRect(0, 0, w, h);

		// subtle grid
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(80, 220, 255, 0.08)';
		const grid = 16;
		for (let x = 0; x <= w; x += grid) {
			ctx.beginPath();
			ctx.moveTo(x + 0.5, 0);
			ctx.lineTo(x + 0.5, h);
			ctx.stroke();
		}
		for (let y = 0; y <= h; y += grid) {
			ctx.beginPath();
			ctx.moveTo(0, y + 0.5);
			ctx.lineTo(w, y + 0.5);
			ctx.stroke();
		}

		// label
		ctx.font = '600 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
		ctx.fillStyle = 'rgba(190, 255, 255, 0.75)';
		ctx.fillText(kind === 'ekg' ? 'ECG' : 'SpO₂', 12, 22);
		if (kind === 'pulseox') {
			ctx.font = '700 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
			ctx.fillStyle = 'rgba(190, 255, 255, 0.9)';
			ctx.fillText('98', 64, 24);
		}

		// waveform
		ctx.lineWidth = 2;
		ctx.strokeStyle = stroke;
		ctx.shadowBlur = 10;
		ctx.shadowColor = stroke;

		const speed = kind === 'ekg' ? 1.2 : 0.9;
		const amplitude = kind === 'ekg' ? 0.9 : 0.6;
		const spikeBoost = 1 + clamp(spike, 0, 1) * 1.6;

		ctx.beginPath();
		for (let x = 0; x < w; x++) {
			const p = x / w;
			let y = 0;
			if (kind === 'ekg') {
				y = ekgAt(p * 1.2 + time * speed);
				y = Math.sign(y) * Math.pow(Math.abs(y), 0.9) * spikeBoost;
			} else {
				const phase = (p * 2 + time * speed) * Math.PI * 2;
				y = Math.sin(phase) * 0.65;
				y *= spikeBoost;
			}
			const yy = cy - y * (h * 0.32) * amplitude;
			if (x === 0) ctx.moveTo(x, yy);
			else ctx.lineTo(x, yy);
		}
		ctx.stroke();
		ctx.shadowBlur = 0;

		// border
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgba(120, 240, 255, 0.22)';
		ctx.strokeRect(1, 1, w - 2, h - 2);

		// tiny center blip
		ctx.fillStyle = 'rgba(140, 255, 255, 0.35)';
		ctx.fillRect(cx - 1, cy - 1, 2, 2);

		texture.needsUpdate = true;
	};

	return {
		texture,
		draw,
		dispose: () => {
			texture.dispose();
		}
	};
}

