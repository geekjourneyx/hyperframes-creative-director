import {frame, progress, ease} from './shared.mjs';
export function createStudy(options) {
  const scene = frame(options, `<div class="eyebrow">03 / Surface and light</div><div class="surface"><div class="texture"></div><div class="sweep"></div><div class="edge"></div><p data-text>FORM <span>/ 01</span></p></div><div class="source">Original material illustration / simulated light</div>`, `
    .scene{background:#e4e0d5}.surface{position:absolute;left:23%;top:22%;width:54%;height:56%;overflow:hidden;border-radius:18px;background:linear-gradient(135deg,#53695d,#263c35);box-shadow:12px 24px 30px #25302635,1px 2px 2px #fff8 inset}
    .surface p{position:absolute;left:10%;top:38%;color:#f2eedc;font-size:6cqw;letter-spacing:-.04em;font-weight:700}.surface p span{font-size:2cqw;font-weight:400}
    .texture{position:absolute;inset:0;background-image:var(--texture,repeating-linear-gradient(25deg,#fff2 0 1px,transparent 1px 5px));opacity:.15}
    .sweep{position:absolute;inset:-50%;background:linear-gradient(110deg,transparent 35%,#fff5 49%,transparent 65%)}
    .edge{position:absolute;inset:0;border:2px solid #dbe7c66b;border-radius:18px}
    .weak .surface{box-shadow:0 0 90px 55px #bdedcd;background:#73867b}.weak .texture{opacity:.9}
    .weak .sweep{background:radial-gradient(ellipse,#fff 20%,transparent 60%)}
    .portrait .surface{left:10%;width:80%;top:28%;height:38%}.portrait .surface p{font-size:11cqw}.portrait .surface p span{font-size:4cqw}
  `);
  const sweep = scene.host.querySelector('.sweep');
  return {...scene, renderAt(t) {
    const p = ease(progress(t, .2, 3.2));
    sweep.style.transform = `translateX(${-55 + 90 * p}%)`;
    sweep.style.opacity = String(options.variant === 'weak' ? .8 : 1 - .65 * progress(t, 3.2, 4));
  }};
}
