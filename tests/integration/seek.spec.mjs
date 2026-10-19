import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneServer,launchBrowser} from './browser-helper.mjs';
for(const mode of ['canvas','webgl'])test(`${mode}: real installed runtime seeks backwards and cold starts deterministically`,async()=>{
 const server=await sceneServer();let browser;
 try{
  browser=await launchBrowser();const page=await browser.newPage();
  const open=async(seed=7)=>{await page.goto(`${server.url}/?mode=${mode}&seed=${seed}`);await page.waitForFunction(()=>window.__playerReady&&window.sceneReady,undefined,{timeout:8000});};
  const seek=async t=>{await page.evaluate(async t=>{await window.__hf.buildReady.scene;await window.__player.renderSeek(t);await window.__hfWaitForSeekCompletion?.();},t);return page.locator('canvas').screenshot();};
  await open();const seen=new Map();
  for(const t of [0,1,2,1,0,2]){const data=await seek(t);if(seen.has(t))assert.deepEqual(data,seen.get(t));else seen.set(t,data);}
  assert.notDeepEqual(seen.get(0),seen.get(1));
  for(const t of [0,1,2]){await open();assert.deepEqual(await seek(t),seen.get(t));}
  await open(99);assert.notDeepEqual(await seek(1),seen.get(1));
  await open();await seek(1-1/30);assert.equal(await page.evaluate(()=>window.sceneShot),'opening');await seek(1);assert.equal(await page.evaluate(()=>window.sceneShot),'arrival');
 }finally{await browser?.close();await server.close();}
});
