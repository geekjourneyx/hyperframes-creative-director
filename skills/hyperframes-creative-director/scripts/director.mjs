#!/usr/bin/env node
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {probeEnvironment,initWorkspace} from './environment.mjs';
import {submitBrief,recordApproval,checkApproval,readSpecification,readKeyframes,digestBrief} from './approval.mjs';
import {inspectVideo,validateSources} from './evidence.mjs';
import {decideDelivery} from './review.mjs';
import {inside,readJSON,writeJSON,fileHash,run,DirectorError} from './io.mjs';

const commands={doctor:['workspace'],init:['parent','name'],submit:['workspace'],approve:['workspace','confirmation'],'check-approval':['workspace'],render:['workspace','output'],inspect:['workspace','video','expectation'],delivery:['workspace','review'],help:[]};
const usage=`Creative Director helpers (Node.js >=22)
  doctor --workspace PATH
  init --parent PATH --name NEW_DIRECTORY
  submit --workspace PATH
  approve --workspace PATH --confirmation USER_CONFIRMATION.json
  check-approval --workspace PATH
  render --workspace PATH --output FINAL.mp4
  inspect --workspace PATH --video FINAL.mp4 [--expectation EXPECTATION.json]
  delivery --workspace PATH --review .director/review.json

Relative file arguments resolve inside the film workspace. Show the real keyframes
and brief, then record actual user approval. These helpers do not authenticate users.
Exit codes: 0 completed, 2 input/approval needed, 3 environment failure, 4 quality blocked.
`;
function parse(argv){
  const [command='help',...args]=argv;if(!Object.hasOwn(commands,command))throw new DirectorError('Unknown command');
  const flags={};for(let i=0;i<args.length;i+=2){const name=args[i].slice(2);if(!args[i].startsWith('--')||!commands[command].includes(name)||!args[i+1]||args[i+1].startsWith('--')||name in flags)throw new DirectorError('Unknown, duplicate or missing option: '+args[i]);flags[name]=args[i+1];}
  return {command,flags};
}
async function expectationFor(root,path){
  const brief=await readFile(await inside(root,'BRIEF.md'),'utf8');
  const spec=readSpecification(brief),keyframeTimes=readKeyframes(brief).map(f=>f.time);
  let extra={};if(path){extra=await readJSON(await inside(root,path));for(const [k,v] of Object.entries(spec))if(extra[k]!==v)throw new DirectorError('Expectation differs from approved brief: '+k);
    if(extra.keyframeTimes&&JSON.stringify(extra.keyframeTimes)!==JSON.stringify(keyframeTimes))throw new DirectorError('Keyframe times differ from approved brief');}
  return {...spec,keyframeTimes,cutTimes:extra.cutTimes??[]};
}
async function requireApproval(root){const result=await checkApproval(root);if(!result.ok)throw new DirectorError(result.reason);return result;}
export async function main(argv){
  const {command,flags}=parse(argv);
  if(command==='help')return {output:usage,exitCode:0};
  if(command==='init'){if(!flags.parent||!flags.name)throw new DirectorError('init requires parent and name');return {output:await initWorkspace({parent:flags.parent,name:flags.name}),exitCode:0};}
  if(!flags.workspace)throw new DirectorError('workspace is required');const root=await realpath(flags.workspace);
  if(command==='doctor'){const result=await probeEnvironment({workspace:root});return {output:result,exitCode:result.checks.some(c=>c.status==='fail')?3:0};}
  if(command==='submit')return {output:await submitBrief(root),exitCode:0};
  if(command==='approve'){if(!flags.confirmation)throw new DirectorError('confirmation is required');return {output:await recordApproval(root,await readJSON(await inside(root,flags.confirmation))),exitCode:0};}
  if(command==='check-approval'){const result=await checkApproval(root);return {output:result,exitCode:result.ok?0:2};}
  await requireApproval(root);
  if(command==='render'){
    if(!flags.output||!flags.output.endsWith('.mp4'))throw new DirectorError('output must be an MP4 path');
    const output=await inside(root,flags.output,{missing:true});
    const state=await readJSON(await inside(root,'.director/state.json'));state.phase='producing';await writeJSON(root,'.director/state.json',state);
    const result=await run('npx',['hyperframes','render','-o',output],{cwd:root,timeout:3600000});
    if(result.code!==0)throw new DirectorError('HyperFrames render failed; rerun the official CLI for local diagnostics',3);
    await requireApproval(root);state.phase='reviewing';await writeJSON(root,'.director/state.json',state);
    return {output:{videoPath:output,phase:'reviewing'},exitCode:0};
  }
  if(command==='inspect'){
    if(!flags.video)throw new DirectorError('video is required');
    const expectation=await expectationFor(root,flags.expectation);
    const videoPath=await inside(root,flags.video);
    const outputDir=await inside(root,'.director/evidence',{missing:true});
    const evidence=await inspectVideo({videoPath,expectation,outputDir});
    await requireApproval(root);
    evidence.briefDigest=await digestBrief(root);await writeJSON(root,'.director/evidence.json',evidence);
    const state=await readJSON(await inside(root,'.director/state.json'));state.phase='reviewing';await writeJSON(root,'.director/state.json',state);
    return {output:evidence,exitCode:evidence.checks.some(c=>c.status==='fail')?4:evidence.checks.some(c=>c.status==='unverified')?3:0};
  }
  if(!flags.review)throw new DirectorError('review is required');
  const evidence=await readJSON(await inside(root,'.director/evidence.json'));
  const review=await readJSON(await inside(root,flags.review));
  const digest=await digestBrief(root);
  if(evidence.briefDigest!==digest||review.briefDigest!==digest)throw new DirectorError('Evidence/review belongs to an old brief',4);
  if(await fileHash(await inside(root,evidence.videoPath))!==evidence.videoSha256)throw new DirectorError('Final video changed; inspect and review it again',4);
  const expected=await expectationFor(root);
  for(const [k,v] of Object.entries(expected))if(k!=='cutTimes'&&JSON.stringify(evidence.expectation?.[k])!==JSON.stringify(v))throw new DirectorError('Evidence does not match approved specification',4);
  const list=value=>Array.isArray(value)?value:[];
  const paths=[...list(evidence.artifacts),...list(evidence.checks).flatMap(c=>list(c?.evidence)),...list(review.findings).flatMap(f=>list(f?.evidence))];
  for(const path of paths){
    if(typeof path!=='string'||!(await stat(await inside(root,path))).isFile())throw new DirectorError('Missing evidence file',4);
  }
  const sources=await readJSON(await inside(root,'sources.json'));const issues=validateSources(sources);
  for(const source of Array.isArray(sources)?sources:[])if(typeof source.path==='string')await inside(root,source.path);
  const decision=decideDelivery({approvalValid:true,evidence,review});
  if(issues.length){decision.status='changes_required';decision.reasons.push(...issues);}
  await writeJSON(root,'.director/delivery.json',decision);
  const state=await readJSON(await inside(root,'.director/state.json'));state.phase=decision.status==='ready'?'delivered':'reviewing';await writeJSON(root,'.director/state.json',state);
  return {output:decision,exitCode:decision.status==='ready'?0:4};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{const {output,exitCode}=await main(process.argv.slice(2));console.log(typeof output==='string'?output:JSON.stringify(output,null,2));process.exitCode=exitCode;}
  catch(e){console.error(e.message);process.exitCode=e.exitCode??2;}
}
