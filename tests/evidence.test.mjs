import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {inspectVideo,validateSources} from '../skills/hyperframes-creative-director/scripts/evidence.mjs';import {run} from '../skills/hyperframes-creative-director/scripts/io.mjs';
const expected={width:64,height:64,fps:10,durationSeconds:1,audioRequired:true,keyframeTimes:[0,.9],cutTimes:[.5]};
async function fixture(audio=true,color='red'){const root=await mkdtemp(join(tmpdir(),'director-media-'));const video=join(root,'film.mp4');const r=await run('ffmpeg',['-v','error','-f','lavfi','-i',`color=${color}:s=64x64:r=10:d=1`,...(audio?['-f','lavfi','-i','sine=frequency=440:duration=1']:[]),'-c:v','libx264','-threads','1','-pix_fmt','yuv420p',...(audio?['-c:a','aac','-shortest']:[]),video]);assert.equal(r.code,0,r.stderr);return{root,video};}
test('real media produces six technical passes and source-bound samples and clips',async()=>{const {root,video}=await fixture();const e=await inspectVideo({videoPath:video,expectation:expected,outputDir:join(root,'evidence')});for(const id of ['decode','video_track','dimensions','frame_rate','duration','audio_presence'])assert.equal(e.checks.find(c=>c.id===id)?.status,'pass',id);assert(e.artifacts.some(p=>p.endsWith('.mp4')));assert(e.artifacts.some(p=>p.endsWith('.png')));for(const p of e.artifacts)assert((await readFile(p)).length);assert(e.artifacts.every(p=>p.includes(e.videoSha256.slice(0,12))));});
test('missing audio, wrong dimensions/fps/duration fail instead of being waived',async()=>{const {root,video}=await fixture(false);const e=await inspectVideo({videoPath:video,expectation:{...expected,width:128,fps:30,durationSeconds:2},outputDir:join(root,'e')});for(const id of ['audio_presence','dimensions','frame_rate','duration'])assert.equal(e.checks.find(c=>c.id===id).status,'fail');});
test('corrupt media fails; unavailable tools are unverified; black is a candidate',async()=>{const {root,video}=await fixture(false,'black');const e=await inspectVideo({videoPath:video,expectation:{...expected,audioRequired:false},outputDir:join(root,'e')});assert(e.checks.some(c=>c.id.startsWith('black_')&&c.status==='candidate'));await writeFile(video,'not video');const bad=await inspectVideo({videoPath:video,expectation:expected,outputDir:join(root,'e')});assert(bad.checks.some(c=>c.status==='fail'));const missing=await inspectVideo({videoPath:video,expectation:expected,outputDir:join(root,'e'),run:async()=>({code:127,stderr:'missing',stdout:''})});assert(missing.checks.every(c=>c.status==='unverified'));});
test('sources require provenance and resolved permission, not just a URL',()=>{assert.equal(validateSources([]).length,0);assert(validateSources([{path:'clip.mp4',source:'https://example.org',license:'https://license.org',permission:'unknown'}]).length>0);assert.equal(validateSources([{path:'clip.mp4',source:'created in project',license:'own work',permission:'resolved',evidence:'source code'}]).length,0);});
test('evidence hash-directory and image symlinks cannot overwrite outside files',async()=>{
 const {symlink,mkdir,rm}=await import('node:fs/promises');const {fileHash}=await import('../skills/hyperframes-creative-director/scripts/io.mjs');
 for(const kind of ['directory','image']){
  const {root,video}=await fixture();const outside=await mkdtemp(join(tmpdir(),'director-sentinel-'));const victim=join(outside,'frame-0.000000.png');await writeFile(victim,'preserve');
  const outputDir=join(root,'evidence');await mkdir(outputDir);const hashDir=join(outputDir,(await fileHash(video)).slice(0,12));
  if(kind==='directory')await symlink(outside,hashDir);else{await mkdir(hashDir);await symlink(victim,join(hashDir,'frame-0.000000.png'));}
  await assert.rejects(inspectVideo({videoPath:video,expectation:expected,outputDir}),/escape|symlink/i);assert.equal(await readFile(victim,'utf8'),'preserve');
 }
});
test('silence intervals stop when sound resumes and retain unfinished tail silence',async()=>{
 const {root,video}=await fixture();
 const sound=join(root,'pauses.mp4');const r=await run('ffmpeg',['-v','error','-f','lavfi','-i','color=red:s=64x64:r=10:d=2','-f','lavfi','-i','aevalsrc=if(between(t\\,0.5\\,1.5)\\,0.2*sin(2*PI*440*t)\\,0):s=48000:d=2','-c:v','libx264','-threads','1','-c:a','aac','-shortest',sound]);assert.equal(r.code,0,r.stderr);
 const e=await inspectVideo({videoPath:sound,expectation:{...expected,durationSeconds:2},outputDir:join(root,'e')});const pauses=e.checks.filter(c=>c.id.startsWith('silence_'));
 assert.equal(pauses.length,2);assert(pauses[0].range[1]<.6);assert(pauses[1].range[0]>1.4);assert(pauses[1].range[1]<=2);
});
test('optional loudness evidence binds raw output to the final file without a target gate',async()=>{
 const {root,video}=await fixture();
 const e=await inspectVideo({videoPath:video,expectation:expected,outputDir:join(root,'e')});
 assert.equal(e.audioMetrics.status,'measured');assert(Number.isFinite(e.audioMetrics.integratedLufs));assert(Number.isFinite(e.audioMetrics.truePeakDbtp));
 const record=JSON.parse(await readFile(e.audioMeasurement.path,'utf8'));assert.equal(record.videoSha256,e.videoSha256);assert.equal(record.stream,'0:a:0');assert(record.raw.stderr.includes('input_i'));
 assert(!e.checks.some(c=>c.id==='loudness'));
 const disabled=await inspectVideo({videoPath:video,expectation:expected,outputDir:join(root,'disabled'),measureAudioMetrics:false});
 assert.equal(disabled.audioMetrics.status,'unverified');assert.equal(disabled.audioMeasurement,undefined);
 const unavailable=await inspectVideo({videoPath:video,expectation:expected,outputDir:join(root,'missing'),run:async(bin,args)=>args.some(arg=>arg.startsWith('loudnorm='))?{code:127,stdout:'',stderr:'missing filter'}:run(bin,args)});
 assert.equal(unavailable.audioMetrics.status,'unverified');assert.equal(unavailable.checks.find(c=>c.id==='audio_presence').status,'pass');
});
