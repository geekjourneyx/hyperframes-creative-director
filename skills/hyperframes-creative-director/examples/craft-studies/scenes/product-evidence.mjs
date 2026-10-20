import {frame, progress, ease} from './shared.mjs';
export function createStudy(options) {
  const scene = frame(options, `<div class="eyebrow">02 / From sources to action</div>
    <h1 data-text>Find the next step.</h1><div class="columns">
    <div class="panel input"><small>Sources</small><p data-text>Research notes</p><p data-text>Team feedback</p><p data-text>Open questions</p></div>
    <div class="panel result"><small>Action list</small><p data-text>Read the findings</p><p data-text>Resolve the question</p><p data-text>Share the decision</p></div></div>
    <div class="source">Illustrative UI / no performance claim</div>`, `
    h1{position:absolute;left:7%;top:17%;font-size:4.2cqw;letter-spacing:-.04em}
    .columns{position:absolute;left:7%;top:35%;width:86%;height:47%;display:flex;gap:4%}
    .panel{width:48%;padding:3%;background:#fffdfa;border:1px solid #b7c2b7;box-shadow:0 14px 25px #24392b0c;border-radius:12px}
    .panel small{font-size:1.4cqw;text-transform:uppercase;letter-spacing:.1em;color:#587462}
    .panel p{font-size:2cqw;line-height:1.3;border-bottom:1px solid #d5ddd3;padding:4% 0}
    .result{background:#deeadb;border-color:#8ba480}.result small{color:#304e29}
    .portrait h1{top:17%;font-size:8cqw}.portrait .columns{top:30%;height:53%;flex-direction:column;gap:5%}
    .portrait .panel{width:100%;height:48%;padding:4%}.portrait .panel p{font-size:3.6cqw;padding:1% 0}.portrait .panel small{font-size:3cqw}
  `);
  const input = scene.host.querySelector('.input');
  const result = scene.host.querySelector('.result');
  return {...scene, renderAt(t) {
    const p = ease(progress(t, .6, 2.6));
    if (options.variant === 'weak') {
      input.style.transform = `translateX(${Math.sin(t * 2) * 18}%) scale(.65)`;
      result.style.transform = `translateY(${Math.sin(t * 3) * 45}%) scale(.7)`;
      result.style.clipPath = 'inset(24% 0 20% 0)';
    } else {
      input.style.transform = `translateX(${(1 - p) * 4}%)`;
      result.style.transform = `translateX(${(1 - p) * 12}%)`;
      result.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    }
  }};
}
