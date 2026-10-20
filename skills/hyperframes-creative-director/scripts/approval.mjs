import {readFile,stat} from 'node:fs/promises';import {extname} from 'node:path';
import {inside,readJSON,writeJSON,sha256,fileHash,run,DirectorError} from './io.mjs';
export function readSpecification(text){
 const front=text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];if(!front)throw new DirectorError('BRIEF.md needs format frontmatter');
 // Read only our flat technical keys; leave other workflows' metadata untouched.
 const fields={};const keys=['width','height','fps','durationSeconds','audioRequired'];
 for(const line of front.split(/\r?\n/)){
  const m=line.match(/^([A-Za-z]+):\s*(.*)$/);if(!m||!keys.includes(m[1]))continue;
  if(Object.hasOwn(fields,m[1]))throw new DirectorError('Duplicate brief metadata: '+m[1]);
  const value=m[2].match(/^(?:"([^"]*)"|'([^']*)'|([^#]*?))\s*(?:#.*)?$/);
  if(!value)throw new DirectorError('Invalid brief metadata: '+m[1]);
  fields[m[1]]=(value[1]??value[2]??value[3]).trim();
 }
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
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
function validConfirmation(value){
 return value?.actor==='user'&&nonempty(value.text)&&nonempty(value.sourceRef)&&typeof value.at==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value.at)&&Number.isFinite(Date.parse(value.at));
}
function validKeyframeReview(value,digest,frames){
 return value?.status==='pass'&&value.briefDigest===digest&&nonempty(value.reviewer)&&Array.isArray(value.inspected)&&frames.every(f=>value.inspected.includes(f.id))&&Array.isArray(value.findings)&&value.findings.length===0;
}
export async function recordApproval(root,confirmation){
 if(!validConfirmation(confirmation))throw new DirectorError('Supply the actual user confirmation text, source and ISO timestamp');
 const state=await readJSON(await inside(root,'.director/state.json'));
 if(state.schemaVersion!==1||state.phase!=='awaiting_approval')throw new DirectorError('Submit the brief before approval');
 const {frames}=await loadBrief(root);const briefDigest=await digestBrief(root);
 if(state.briefDigest!==briefDigest)throw new DirectorError('Brief changed; submit and review again');
 const review=await readJSON(await inside(root,'.director/keyframe-review.json'));
 if(!validKeyframeReview(review,briefDigest,frames))throw new DirectorError('Current keyframes need a complete, resolved visual review');
 const next={schemaVersion:1,phase:'approved',approval:{briefDigest,keyframes:frames,confirmation,keyframeReview:review}};await writeJSON(root,'.director/state.json',next);return next;
}
export async function checkApproval(root){
 try{
  const state=await readJSON(await inside(root,'.director/state.json'));const a=state.approval;
  if(state.schemaVersion!==1||!['approved','producing','reviewing','delivered'].includes(state.phase)||!a)return {ok:false,reason:'User approval is missing; submit and approve the brief'};
  let reason;
  try{
   const {frames}=await loadBrief(root);const digest=await digestBrief(root);
   if(a.briefDigest!==digest)reason='Approved brief or keyframes changed';
   else if(!validConfirmation(a.confirmation)||!validKeyframeReview(a.keyframeReview,digest,frames)||JSON.stringify(a.keyframes)!==JSON.stringify(frames))reason='Stored approval evidence is incomplete';
  }catch(e){reason=e.message;}
  if(!reason)return {ok:true};
  // Retain the old record for diagnosis, but require submission and fresh review.
  await writeJSON(root,'.director/state.json',{...state,phase:'awaiting_approval',briefDigest:null,invalidationReason:reason});
  return {ok:false,reason:reason+'; submit and review again'};
 }catch(e){return {ok:false,reason:e.message};}
}
