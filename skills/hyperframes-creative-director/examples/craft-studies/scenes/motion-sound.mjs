import {frame, progress, ease} from './shared.mjs';
export function createStudy(options) {
  const scene = frame(options, `<div class="eyebrow">06 / Arrival and rest</div><div class="phrase"><p data-text>Make it clear</p><span class="carrier"></span></div><div class="baseline"></div><div class="source">Original motion study / optional synthesized sound</div>`, `
    .phrase{position:absolute;left:12%;top:42%;width:76%;font-size:7cqw;font-weight:700;letter-spacing:-.05em;line-height:1}
    .carrier{position:absolute;left:88%;bottom:0;width:2.1cqw;height:2.1cqw;border-radius:50%;background:#b75034;transform-origin:50% 100%}
    .baseline{position:absolute;left:12%;top:65%;width:76%;height:1px;background:#c5cabe}
    .portrait .phrase{left:8%;width:84%;font-size:10cqw}.portrait .carrier{left:89%;width:3cqw;height:3cqw}
  `);
  const carrier = scene.host.querySelector('.carrier');
  return {...scene, renderAt(t) {
    let x, y, sy;
    if (options.variant === 'weak') {
      x = Math.sin(t*4) * 150; y = -Math.abs(Math.sin(t*4)) * 100; sy = 1;
    } else {
      const travel = ease(progress(t, .4, 2.4));
      x = -400 * (1-travel);
      y = -130 * Math.sin(Math.PI * travel);
      sy = 1 - .25 * Math.sin(Math.PI * progress(t, 2.4, 2.7));
    }
    // Scale offsets with frame width; the layout remains stable in portrait.
    const scale = (options.assets?.width || 960) / 960;
    carrier.style.transform = `translate(${x*scale}px,${y*scale}px) scale(${1/sy},${sy})`;
  }};
}
