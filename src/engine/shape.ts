import type { ShapeKind, View } from './params';

/** Path de un círculo (dos arcos). */
function circlePath(cx: number, cy: number, r: number, sweep = 1): string {
  return (
    `M${cx - r} ${cy}` +
    `A${r} ${r} 0 1 ${sweep} ${cx + r} ${cy}` +
    `A${r} ${r} 0 1 ${sweep} ${cx - r} ${cy}Z`
  );
}

/** Path de una píldora (stadium) horizontal. */
function stadiumPath(cx: number, cy: number, w: number, h: number): string {
  const r = h / 2;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - r;
  const y1 = cy + r;
  return (
    `M${x0} ${y0}` +
    `L${x1} ${y0}` +
    `A${r} ${r} 0 0 1 ${x1} ${y1}` +
    `L${x0} ${y1}` +
    `A${r} ${r} 0 0 1 ${x0} ${y0}Z`
  );
}

/** Path de un arco arquitectónico (puerta): rectángulo con remate semicircular. */
function archPath(cx: number, cy: number, w: number, h: number): string {
  const r = w / 2;
  const x0 = cx - r;
  const x1 = cx + r;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  return (
    `M${x0} ${y1}` +
    `L${x0} ${y0 + r}` +
    `A${r} ${r} 0 0 1 ${x1} ${y0 + r}` +
    `L${x1} ${y1}Z`
  );
}

/** Path de un rombo. */
function rhombusPath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx} ${cy - ry}L${cx + rx} ${cy}L${cx} ${cy + ry}L${cx - rx} ${cy}Z`;
}

/**
 * Devuelve el atributo `d` del contenedor de FORMA. La "O de cauce" es un
 * anillo (letterform), no un mandala: el patrón lo rellena manteniendo
 * dirección. LETRA no pasa por aquí (se recorta con <text>).
 */
export function shapePath(kind: ShapeKind, customPath: string, view: View): { d: string; fillRule: 'nonzero' | 'evenodd' } {
  const CX = view.w / 2;
  const CY = view.h / 2;
  const R = Math.min(view.w, view.h) * 0.42;
  switch (kind) {
    case 'circulo':
      return { d: circlePath(CX, CY, R), fillRule: 'nonzero' };
    case 'pildora':
      return { d: stadiumPath(CX, CY, view.w * 0.72, view.h * 0.44), fillRule: 'nonzero' };
    case 'o-cauce':
      // Anillo: círculo exterior + interior, relleno evenodd.
      return { d: circlePath(CX, CY, R, 1) + circlePath(CX, CY, R * 0.52, 0), fillRule: 'evenodd' };
    case 'arco':
      return { d: archPath(CX, CY, Math.min(view.w, view.h) * 0.6, Math.min(view.w, view.h) * 0.82), fillRule: 'nonzero' };
    case 'rombo':
      return { d: rhombusPath(CX, CY, Math.min(view.w, view.h) * 0.46, Math.min(view.w, view.h) * 0.46), fillRule: 'nonzero' };
    case 'letra':
    case 'custom':
      return { d: customPath || circlePath(CX, CY, R), fillRule: 'nonzero' };
  }
}
