import {frame, progress, ease} from './shared.mjs';
export function createStudy(options) {
  const scene = frame(options, `<div class="eyebrow">04 / Continuity</div><h1 data-text>Find the connection.</h1><div class="portal"><div class="link"></div><p data-text class="label"></p><p data-text class="detail"></p></div><div class="source">Conceptual source → result / original study</div>`, `
    h1{position:absolute;left:7%;top:17%;font-size:4.5cqw;letter-spacing:-.04em}
    .portal{position:absolute;left:25%;top:36%;width:50%;height:42%;border:2px solid #a84c36;border-radius:12px;background:#f8e5d4;overflow:hidden}
    .link{position:absolute;left:10%;top:20%;width:8%;aspect-ratio:1;border-radius:50%;background:#a84c36;box-shadow:50px 0 0 #a84c36}
    .label{position:absolute;left:10%;top:40%;font-size:3.6cqw;font-weight:700}.detail{position:absolute;left:10%;top:69%;font-size:1.7cqw}
    .portrait h1{font-size:8cqw;top:20%}.portrait .portal{left:10%;width:80%;top:38%;height:32%}.portrait .label{font-size:7cqw}.portrait .detail{font-size:3.3cqw}.portrait .link{box-shadow:28px 0 0 #a84c36}
  `);
  const portal = scene.host.querySelector('.portal');
  return {...scene, renderAt(t) {
    const p = ease(progress(t, .5, 2.4));
    const after = t >= 3;
    scene.host.querySelector('.label').textContent = after ? 'Result' : 'Source';
    scene.host.querySelector('.detail').textContent = after ? 'A clear next step' : 'A shared question';
    portal.style.background = after ? '#d9e5da' : '#f8e5d4';
    portal.style.clipPath = options.variant === 'weak'
      ? `polygon(0 0,${p * 100}% 0,100% ${p * 100}%,0 100%)`
      : `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}% round 12px)`;
    portal.style.transform = options.variant === 'weak'
      ? `translate(${after ? 25 : -12}%,${after ? -14 : 10}%) rotate(${after ? -12 : 12}deg)` : 'none';
  }};
}
