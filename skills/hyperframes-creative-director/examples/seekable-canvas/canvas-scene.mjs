export function createCanvasScene(canvas, seed = 7) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  return { renderAt(time) {
    const { width: w, height: h } = canvas;
    ctx.fillStyle = time < 1 ? '#112333' : '#243d42';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) {
      // Analytical positions can be evaluated in any order without accumulated state.
      const phase = (Math.imul(seed + i, 2654435761) >>> 0) / 4294967296 * Math.PI * 2;
      const x = w / 2 + Math.cos(phase + time) * (70 + i * 7);
      const y = h / 2 + Math.sin(phase + time * 0.7) * (40 + i * 4);
      ctx.fillStyle = `hsl(${150 + i * 4} 75% 65%)`;
      ctx.beginPath(); ctx.arc(x, y, 3 + i % 5, 0, Math.PI * 2); ctx.fill();
    }
  }};
}
