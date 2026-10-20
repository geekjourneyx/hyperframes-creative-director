import {frame, progress, ease} from './shared.mjs';
export function createStudy(options) {
  const zh = options.assets?.locale === 'zh';
  const headline = zh ? '把分散的信息，变成清晰的下一步。' : 'Make room for what matters.';
  const a = zh ? '把分散的信息，' : 'Make room';
  const b = zh ? '变成清晰的下一步。' : 'for what matters.';
  const scene = frame(options, `<div class="eyebrow">01 / Attention</div>
    <div class="rule"></div><div class="headline"><p data-text class="first">${a}</p><p data-text class="second">${b}</p></div>
    <p data-text class="support">${zh ? '减少干扰，让重要的内容被看见。' : 'Less noise. A clearer next step.'}</p>
    <div class="source">Original copy / typography study</div>`, `
    .headline{position:absolute;left:7%;top:25%;width:86%;font-size:7cqw;font-weight:700;line-height:1.06;letter-spacing:-.045em}
    .second{color:#bf4b32}.rule{position:absolute;left:7%;top:20%;height:3px;background:#bf4b32;width:12%}
    .support{position:absolute;left:7%;top:78%;width:80%;font-size:2cqw;line-height:1.4}
    .portrait .headline{top:27%;font-size:9cqw;line-height:1.35;letter-spacing:0}
    .portrait .support{top:74%;font-size:4.2cqw}
    .weak .headline{font-size:4cqw;top:39%;font-weight:400;letter-spacing:0}
    .weak .support{font-size:3cqw;top:66%}.weak .second{color:inherit}.weak .rule{display:none}
    .weak.portrait .headline{font-size:6cqw}.weak.portrait .support{font-size:5cqw}
  `);
  const first = scene.host.querySelector('.first');
  const second = scene.host.querySelector('.second');
  const support = scene.host.querySelector('.support');
  return {...scene, renderAt(t) {
    const p = ease(progress(t, .3, 2.4));
    if (options.variant === 'weak') {
      first.textContent = headline.slice(0, Math.floor(headline.length * progress(t, .3, 3.6)));
      second.textContent = '';
    } else {
      first.style.transform = `translateY(${(1 - p) * -18}%)`;
      second.style.transform = `translateY(${-35 + 65 * p}%)`;
      second.style.opacity = String(.2 + .8 * p);
    }
    support.style.opacity = String(.3 + .7 * ease(progress(t, 2, 2.8)));
  }};
}
