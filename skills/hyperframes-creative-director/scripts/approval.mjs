import {readFile,stat} from 'node:fs/promises';import {extname} from 'node:path';
import {inside,readJSON,writeJSON,sha256,fileHash,run,DirectorError} from './io.mjs';
export function readSpecification(text){
 const front=text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];if(!front)throw new DirectorError('BRIEF.md needs format frontmatter');
 const fields={};for(const line of front.split(/\r?\n/)){if(!line.trim())continue;const m=line.match(/^([A-Za-z]+):\s*(\S+)\s*$/);if(!m||m[1] in fields)throw new DirectorError('Invalid or duplicate brief metadata');fields[m[1]]=m[2];}
 const spec={};for(const key of ['width','height','fps','durationSeconds']){spec[key]=Number(fields[key]);if(!Number.isFinite(spec[key])||spec[key]<=0)throw new DirectorError('Invalid '+key);}
 for(const key of ['width','height'])if(!Number.isInteger(spec[key])||spec[key]%2!==0)throw new DirectorError('Use positive even pixel dimensions for H.264');
 if(!['true','false'].includes(fields.audioRequired))throw new DirectorError('audioRequired must be true or false');spec.audioRequired=fields.audioRequired==='true';return spec;
}
export function readKeyframes(text){
 const section=text.match(/^## Keyframes\s*\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1];if(!section)throw new DirectorError('Missing Keyframes section');
 const frames=[];const ids=new Set();
 for(const line of section.split(/\r?\n/)){
  if(!line.trim().startsWith('|'))continue;
  const parts=line.trim().split('|').slice(1,-1).map(x=>x.trim());if(parts[0]==='ID'||parts.every(x=>/^:?-+:?$/.test(x)))continue;
  if(parts.length!==4)throw new DirectorError('Keyframes table needs ID, Time, Path, Kind');
  const [id,t,path,kind]=parts,time=Number(t);
  if(!id||ids.has(id)||!t||!Number.isFinite(time)||time<0||!path||!['concept','rendered'].includes(kind))throw new DirectorError('Invalid keyframe row');
  ids.add(id);frames.push({id,time,path,kind});
 }
 if(!frames.length)throw new DirectorError('At least one actual keyframe is required');return frames;
}
async function loadBrief(root){const text=await readFile(await inside(root,'BRIEF.md'),'utf8');const spec=readSpecification(text),frames=readKeyframes(text);
 for(const f of frames)if(f.time>=spec.durationSeconds)throw new DirectorError('Keyframe time must lie inside film duration');return {text,spec,frames};}
export async function digestBrief(root,keyframes){
 const {text,frames}=await loadBrief(root);if(keyframes&&JSON.stringify(keyframes)!==JSON.stringify(frames))throw new DirectorError('Keyframe list differs from current brief');
 const items=[];for(const f of [...frames].sort((a,b)=>a.path.localeCompare(b.path))){
  const p=await inside(root,f.path);if(!(await stat(p)).isFile())throw new DirectorError('Keyframe must be a file');items.push([f.path.replaceAll('\\','/'),await fileHash(p)]);
 }return sha256(JSON.stringify({text,items}));
}
export async function submitBrief(root){
 const {frames}=await loadBrief(root);
 for(const f of frames){const p=await inside(root,f.path);if(!['.png','.jpg','.jpeg','.webp'].includes(extname(p).toLowerCase())||(await stat(p)).size===0)throw new DirectorError('Use nonempty PNG, JPEG or WebP keyframes');
  const result=await run('ffmpeg',['-v','error','-i',p,'-frames:v','1','-f','null','-'],{cwd:root});
  if(result.code!==0)throw new DirectorError('Cannot decode keyframe '+f.id,result.code===127?3:2);
 }
 const briefDigest=await digestBrief(root);const state={schemaVersion:1,phase:'awaiting_approval',briefDigest};await writeJSON(root,'.director/state.json',state);return state;
}
export async function recordApproval(root,confirmation){
 if(confirmation?.actor!=='user'||typeof confirmation.text!=='string'||!confirmation.text.trim()||typeof confirmation.sourceRef!=='string'||!confirmation.sourceRef.trim()||!Number.isFinite(Date.parse(confirmation.at)))throw new DirectorError('Supply the actual user confirmation text, source and timestamp');
 const state=await readJSON(await inside(root,'.director/state.json'));
 if(state.schemaVersion!==1||state.phase!=='awaiting_approval')throw new DirectorError('Submit the brief before approval');
 const {frames}=await loadBrief(root);const briefDigest=await digestBrief(root);
 if(state.briefDigest!==briefDigest)throw new DirectorError('Brief changed; submit and review again');
 const review=await readJSON(await inside(root,'.director/keyframe-review.json'));
 if(review.status!=='pass'||review.briefDigest!==briefDigest||!review.reviewer?.trim()||!Array.isArray(review.inspected)||!frames.every(f=>review.inspected.includes(f.id))||!Array.isArray(review.findings)||review.findings.length)throw new DirectorError('Current keyframes need a complete, resolved visual review');
 const next={schemaVersion:1,phase:'approved',approval:{briefDigest,keyframes:frames,confirmation,keyframeReview:review}};await writeJSON(root,'.director/state.json',next);return next;
}
export async function checkApproval(root){
 try{const state=await readJSON(await inside(root,'.director/state.json'));const a=state.approval;
  if(state.schemaVersion!==1||!['approved','producing','reviewing','delivered'].includes(state.phase)||!a||a.confirmation?.actor!=='user')return {ok:false,reason:'User approval is missing'};
  if(a.briefDigest!==await digestBrief(root))return {ok:false,reason:'Approved brief or keyframes changed'};
  return {ok:true};
 }catch(e){return {ok:false,reason:e.message};}
}
