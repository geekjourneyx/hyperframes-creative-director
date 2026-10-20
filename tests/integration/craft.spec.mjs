import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import sharp from 'sharp';
import {sceneServer,launchBrowser} from './browser-helper.mjs';
import {run} from '../../skills/hyperframes-creative-director/scripts/io.mjs';
import {inspectVideo,requiredChecks} from '../../skills/hyperframes-creative-director/scripts/evidence.mjs';
import {studyAudio} from '../../skills/hyperframes-creative-director/examples/craft-studies/make-audio.mjs';
const example=resolve('skills/hyperframes-creative-director/examples/craft-studies');
const families=['typography','product-evidence','lighting-materials','masks-transitions','spatial-3d','motion-sound'];
const seek=async(page,time)=>{
  await page.evaluate(async t=>{await window.__hf.buildReady.scene;await window.__player.renderSeek(t);await window.__hfWaitForSeekCompletion?.();},time);
  return page.locator('#study').screenshot();
};
const open=async(page,url)=>{
  await page.goto(url);
  await page.waitForFunction(()=>window.sceneError || (window.sceneReady && window.__playerReady),undefined,{timeout:15000});
  assert.equal(await page.evaluate(()=>window.sceneError),undefined);
};
for(const family of families) for(const variant of ['strong','weak']) {
  test(`${family}/${variant}: real runtime forward, backward and cold seeks`,async()=>{
    const server=await sceneServer(example);let browser;
    try{
      browser=await launchBrowser();const page=await browser.newPage({viewport:{width:960,height:540}});
      const url=`${server.url}/?family=${family}&variant=${variant}`;
      await open(page,url);const seen=new Map();
      for(const t of [0,.8,2.4,4.6,.8,0,4.6]){
        const frame=await seek(page,t);if(seen.has(t))assert.deepEqual(frame,seen.get(t));else seen.set(t,frame);
      }
      assert.notDeepEqual(seen.get(0),seen.get(2.4),'The fixture must actually move');
      for(const t of [.8,4.6]){await open(page,url);assert.deepEqual(await seek(page,t),seen.get(t));}
      if(family==='masks-transitions')assert.notDeepEqual(await seek(page,3-1/30),await seek(page,3),'Inspect both sides of the intended cut');
    }finally{await browser?.close();await server.close();}
  });
}
test('long Chinese copy reflows in portrait; bounding boxes do not certify glyph quality',async()=>{
  const server=await sceneServer(example);let browser;
  try{
    browser=await launchBrowser();const page=await browser.newPage({viewport:{width:360,height:640}});
    await open(page,`${server.url}/?family=typography&locale=zh&portrait=1`);await seek(page,4.6);
    const overflow=await page.locator('[data-text]').evaluateAll(nodes=>nodes.filter(node=>{
      const r=node.getBoundingClientRect(),root=document.querySelector('#study').getBoundingClientRect();
      return r.left<root.left || r.right>root.right+.5 || r.top<root.top || r.bottom>root.bottom+.5 || node.scrollWidth>node.clientWidth+1;
    }).map(node=>node.textContent));
    assert.deepEqual(overflow,[]);
    assert.match(await page.locator('.headline').textContent(),/把分散的信息/);
  }finally{await browser?.close();await server.close();}
});
for(const failure of ['font','texture','webgl'])test(`required ${failure} failure rejects readiness`,async()=>{
  const server=await sceneServer(example);let browser;
  try{
    browser=await launchBrowser();const page=await browser.newPage();
    if(failure==='webgl')await page.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};
    });
    const query=failure==='webgl'?'family=spatial-3d':`${failure}Url=missing.${failure==='font'?'woff2':'png'}`;
    await page.goto(`${server.url}/?${query}`);await page.waitForFunction(()=>window.sceneError);
    assert.equal(await page.evaluate(()=>window.sceneReady),false);
    assert.match(await page.locator('#failure').textContent(),/font|texture|WebGL/);
    assert.equal(await page.evaluate(async()=>{try{await window.__hf.buildReady.scene;return 'resolved';}catch{return 'rejected';}}),'rejected');
  }finally{await browser?.close();await server.close();}
});

test('post-start WebGL loss revokes readiness and makes subsequent capture fail visibly',async()=>{
  const server=await sceneServer(example);let browser;
  try{
    browser=await launchBrowser();const page=await browser.newPage();
    await open(page,`${server.url}/?family=spatial-3d`);await seek(page,2.4);
    const supported=await page.evaluate(()=>{
      const extension=document.querySelector('canvas').getContext('webgl').getExtension('WEBGL_lose_context');
      if(!extension)return false;extension.loseContext();return true;
    });
    assert(supported,'The regression requires the real context-loss extension');
    await page.waitForFunction(()=>window.sceneError?.includes('context lost'));
    assert.equal(await page.evaluate(()=>window.sceneReady),false);
    assert.match(await page.locator('#failure').textContent(),/context lost/);
    await assert.rejects(seek(page,4.6),/context lost/);
  }finally{await browser?.close();await server.close();}
});

// Expensive, deliberately unexecuted during development at the user's request.
// Uses the installed official CLI, not synthetic seek events or a substitute renderer.
for(const family of families)test(`${family}: official MP4 matches preview and audio is preserved`,{timeout:180000},async()=>{
  const parent=await mkdtemp(join(tmpdir(),'craft-export-')),root=join(parent,'film');
  const cli=resolve('node_modules/.bin/hyperframes');
  process.env.HYPERFRAMES_SKIP_SKILLS='1';process.env.HYPERFRAMES_NO_TELEMETRY='1';process.env.DO_NOT_TRACK='1';
  process.env.PRODUCER_BROWSER_GPU_MODE='software';
  if(process.env.CHROMIUM_PATH)process.env.HYPERFRAMES_BROWSER_PATH=process.env.CHROMIUM_PATH;
  const init=await run(cli,['init',root,'--non-interactive']);assert.equal(init.code,0,init.stderr);
  await cp(example,root,{recursive:true});
  await writeFile(join(root,'config.mjs'),`export default ${JSON.stringify({family,variant:'strong',locale:'en'})};\n`);
  let html=await readFile(join(root,'index.html'),'utf8');
  // Reduce export cost while keeping the exact same framing in browser and CLI.
  html=html.replace('data-width="960"','data-width="480"').replace('data-height="540"','data-height="270"');
  if(family==='motion-sound'){
    await writeFile(join(root,'sound.wav'),studyAudio('strong'));
    html=html.replace('</main>','<audio id="study-sound" src="sound.wav" preload="auto" data-start="0" data-duration="6"></audio></main>');
  }
  await writeFile(join(root,'index.html'),html);
  const server=await sceneServer(root);let browser;const previews=new Map();
  try{
    browser=await launchBrowser();const page=await browser.newPage({viewport:{width:480,height:270}});
    await open(page,server.url);
    for(const t of [.8,4.6])previews.set(t,await seek(page,t));
  }finally{await browser?.close();await server.close();}
  const video=join(root,'final.mp4');const render=await run(cli,['render',root,'-o',video,'--quality','draft'],{timeout:120000});
  assert.equal(render.code,0,render.stderr.slice(-2000));
  const evidence=await inspectVideo({videoPath:video,expectation:{width:480,height:270,fps:30,durationSeconds:6,audioRequired:family==='motion-sound',keyframeTimes:[.8,4.6],cutTimes:family==='masks-transitions'?[3]:[]},outputDir:join(root,'evidence')});
  for(const id of requiredChecks)assert.equal(evidence.checks.find(c=>c.id===id)?.status,'pass',id);
  for(const [time,preview] of previews){
    const path=evidence.artifacts.find(p=>p.endsWith(`frame-${time.toFixed(6)}.png`));assert(path);
    const a=await sharp(path).removeAlpha().raw().toBuffer(),b=await sharp(preview).removeAlpha().raw().toBuffer();
    assert.equal(a.length,b.length);let error=0;for(let i=0;i<a.length;i++)error+=Math.abs(a[i]-b[i]);
    assert(error/a.length<12,`Export must match preview at ${time}s, not a loading frame`);
  }
  if(family==='motion-sound'){
    assert.equal(evidence.audioMetrics.status,'measured');
    const scan=await run('ffmpeg',['-hide_banner','-i',video,'-af','silencedetect=noise=-45dB:d=0.1','-f','null','-']);
    assert.equal(scan.code,0,scan.stderr);
    const onset=scan.stderr.match(/silence_end:\s*([\d.]+)/);assert(onset,'Mux must contain an audible arrival after silence');
    assert(Math.abs(Number(onset[1])-2.4)<.08,'Only the designated arrival is tested against the authored audio anchor');
  }else assert.equal(evidence.audioMetrics.status,'not-applicable');
  console.log(`Unreviewed synthetic study export retained: ${root}`);
});
