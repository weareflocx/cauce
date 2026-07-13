import { FlowEngine, type Line } from './field';
import { inkPaper, type TornoParams, type View } from './params';

export interface FrameShape {
  d: string;
  fillRule: CanvasFillRule;
  /** Ajuste (para path pegado): escala + traslación al centro del lienzo. */
  fit?: { tx: number; ty: number; s: number } | null;
}

function strokeLines(ctx: CanvasRenderingContext2D, lines: Line[]): void {
  ctx.beginPath();
  for (const l of lines) {
    const p = l.points;
    if (p.length < 2) continue;
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
  }
  ctx.stroke();
}

/**
 * Dibuja un fotograma del patrón (PATRÓN o FORMA) en un canvas 2D.
 * `view` son las dimensiones lógicas del lienzo; `outW/outH` las del canvas
 * de salida (misma proporción, cualquier escala). `phase` ∈ [0,1).
 */
export function drawPatternFrame(
  ctx: CanvasRenderingContext2D,
  outW: number,
  outH: number,
  params: TornoParams,
  engine: FlowEngine,
  phase: number,
  view: View,
  shape?: FrameShape,
): void {
  const { ink, paper } = inkPaper(params.colorway);
  const sx = outW / view.w;
  const sy = outH / view.h;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, outW, outH);

  ctx.save();
  ctx.scale(sx, sy); // trabajar en coordenadas lógicas del lienzo

  if (shape) {
    let path: Path2D;
    if (shape.fit) {
      const base = new Path2D(shape.d);
      const m = new DOMMatrix([shape.fit.s, 0, 0, shape.fit.s, shape.fit.tx, shape.fit.ty]);
      path = new Path2D();
      path.addPath(base, m);
    } else {
      path = new Path2D(shape.d);
    }
    ctx.clip(path, shape.fillRule);
  }

  const { main, moire } = engine.generate(params, phase, view);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = ink;
  ctx.lineWidth = params.calado;

  if (moire.length) {
    ctx.globalAlpha = 0.5;
    strokeLines(ctx, moire);
    ctx.globalAlpha = 1;
  }
  strokeLines(ctx, main);

  ctx.restore();
}
