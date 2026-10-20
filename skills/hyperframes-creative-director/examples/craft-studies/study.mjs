import defaults from './config.mjs';
const families = ['typography', 'product-evidence', 'lighting-materials', 'masks-transitions', 'spatial-3d', 'motion-sound'];
const query = new URLSearchParams(location.search);
const container = document.querySelector('#study');
const config = {...defaults, width: Number(container.dataset.width), height: Number(container.dataset.height)};
for (const key of ['family', 'variant', 'locale', 'fontUrl', 'textureUrl']) {
  if (query.has(key)) config[key] = query.get(key);
}
if (query.get('portrait') === '1') { config.width = 360; config.height = 640; }
let scene;
let time = 0;
let fatalError;
window.sceneReady = false;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
function reportFailure(error) {
  fatalError = error instanceof Error ? error : new Error(String(error));
  window.sceneError = fatalError.message;
  window.sceneReady = false;
  let diagnostic = container.querySelector('#failure');
  if (!diagnostic) {
    diagnostic = document.createElement('pre');
    diagnostic.id = 'failure';
    container.append(diagnostic);
  }
  diagnostic.textContent = `Craft study failed: ${fatalError.message}`;
  // Revoke readiness even after startup. Subsequent readiness consumers must reject.
  const rejected = Promise.reject(fatalError);
  rejected.catch(() => {});
  window.__hf.buildReady.scene = rejected;
}
container.addEventListener('craft-study-failure', event => reportFailure(event.detail));
// Register before imports/assets begin, using the existing HyperFrames adapter contract.
window.__hf.buildReady.scene = Promise.resolve().then(async () => {
  if (!families.includes(config.family)) throw Error('Unknown study family');
  if (!['strong', 'weak'].includes(config.variant)) throw Error('Unknown study variant');
  for (const key of ['width', 'height']) {
    if (!Number.isInteger(config[key]) || config[key] <= 0) throw Error(`Invalid ${key}`);
  }
  container.style.width = `${config.width}px`;
  container.style.height = `${config.height}px`;
  container.dataset.width = String(config.width);
  container.dataset.height = String(config.height);
  document.documentElement.lang = config.locale;
  const {createStudy} = await import(`./scenes/${config.family}.mjs`);
  scene = createStudy({container, variant: config.variant, assets: config});
  await scene.ready;
  if (fatalError) throw fatalError;
  container.dataset.duration = String(scene.durationSeconds);
  scene.renderAt(time);
  window.sceneReady = true;
});
// Keep the registered promise rejected, while making failure inspectable in preview/tests.
window.__hf.buildReady.scene.catch(reportFailure);
window.addEventListener('hf-seek', event => {
  if (fatalError) throw fatalError;
  const next = event.detail?.time;
  if (!Number.isFinite(next)) throw Error('Seek time must be finite seconds');
  time = Math.max(0, Math.min(6, next));
  if (window.sceneReady) {
    try { scene.renderAt(time); }
    catch (error) { reportFailure(error); throw error; }
  }
});
window.addEventListener('pagehide', () => scene?.dispose(), {once: true});
