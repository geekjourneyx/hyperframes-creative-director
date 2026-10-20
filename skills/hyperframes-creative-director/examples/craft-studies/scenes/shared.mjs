export const clamp = value => Math.max(0, Math.min(1, value));
export const progress = (time, start, end) => clamp((time - start) / (end - start));
export const ease = value => 1 - (1 - clamp(value)) ** 3;

// Private fixture helper, not a renderer or public scene protocol.
export function frame({container, assets = {}, variant = 'strong'}, markup, css = '') {
  if (!['strong', 'weak'].includes(variant)) throw Error('variant must be strong or weak');
  const host = document.createElement('section');
  host.className = `scene ${variant}${assets.height > assets.width ? ' portrait' : ''}`;
  host.innerHTML = `<style>
    .scene{position:absolute;inset:0;overflow:hidden;background:#f3f0e7;color:#192c2b;font-family:Arial,sans-serif}
    .scene .eyebrow{position:absolute;top:7%;left:7%;font-size:1.25cqw;letter-spacing:.15em;text-transform:uppercase}
    .scene .source{position:absolute;bottom:6%;left:7%;font-size:1.25cqw;color:#51625b}
    .scene.portrait .eyebrow,.scene.portrait .source{font-size:3cqw}
    .scene [data-text]{margin:0;overflow-wrap:break-word}
    ${css}
  </style>${markup}`;
  container.append(host);
  let font;
  let disposed = false;
  const ready = (async () => {
    if (assets.fontUrl) {
      font = new FontFace('StudyFont', `url(${JSON.stringify(assets.fontUrl)})`);
      try { await font.load(); } catch { throw Error(`Required font failed: ${assets.fontUrl}`); }
      if (disposed) throw Error('Study disposed during font loading');
      document.fonts.add(font);
      host.style.fontFamily = 'StudyFont, sans-serif';
    }
    await document.fonts.ready;
    if (assets.textureUrl) {
      const texture = new Image();
      texture.src = assets.textureUrl;
      try { await texture.decode(); } catch { throw Error(`Required texture failed: ${assets.textureUrl}`); }
      if (!texture.naturalWidth) throw Error('Required texture is empty');
      host.style.setProperty('--texture', `url(${JSON.stringify(assets.textureUrl)})`);
    }
    // Media must be declared in HTML so the HyperFrames compiler/mixer sees it.
    for (const audio of container.querySelectorAll('audio[src]')) {
      if (audio.readyState >= 2) continue;
      if (audio.error) throw Error('Required audio failed');
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('Required audio load timed out')), 10000);
        audio.addEventListener('loadeddata', () => { clearTimeout(timer); resolve(); }, {once: true});
        audio.addEventListener('error', () => { clearTimeout(timer); reject(Error('Required audio failed')); }, {once: true});
      });
    }
    if (disposed) throw Error('Study disposed during asset loading');
  })();
  return {
    host, ready, durationSeconds: 6,
    dispose() { disposed = true; if (font) document.fonts.delete(font); host.remove(); },
  };
}
