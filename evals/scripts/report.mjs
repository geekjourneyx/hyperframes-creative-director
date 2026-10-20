import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';

const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const controlFields=['model','harnessVersion','environment','assetsSet','budget','reviewMode'];
function validate(runs){
  if(!Array.isArray(runs))throw Error('Runs must be an array');
  const ids=new Set();
  for(const r of runs){
    for(const k of ['runId','caseId','condition','model','harnessVersion','sourceCommit','reviewMode'])if(typeof r[k]!=='string'||!r[k])throw Error('Missing '+k);
    if(ids.has(r.runId))throw Error('Duplicate runId');ids.add(r.runId);
    for(const k of ['environment','assetsSet','budget','repetition','seed'])if(r[k]===undefined||r[k]===null)throw Error('Missing '+k);
    for(const k of ['firstDeliverable','finalDeliverable'])if(typeof r[k]!=='boolean')throw Error('Missing outcome '+k);
    for(const k of ['contentErrors','renderDefects','interventions','elapsedSeconds','tokens','cost'])if(r[k]!==null&&(!Number.isFinite(r[k])||r[k]<0))throw Error('Invalid metric '+k);
    if(!['independent','self-review','unverified'].includes(r.reviewMode))throw Error('Invalid review mode');
  }
}
function group(runs,fields){const map=new Map();for(const r of runs){const controls=Object.fromEntries(fields.map(k=>[k,r[k]]));const key=JSON.stringify(canonical(controls));if(!map.has(key))map.set(key,{controls,rows:[]});map.get(key).rows.push(r);}return [...map.values()];}
export function summarizeRuns(runs){
  validate(runs);
  return group(runs,[...controlFields,'caseId','condition','sourceCommit']).map(({controls,rows})=>{
    const known=rows.filter(r=>r.cost!==null);
    return {controls,runs:rows.length,firstSuccessRate:rows.filter(r=>r.firstDeliverable).length/rows.length,finalSuccessRate:rows.filter(r=>r.finalDeliverable).length/rows.length,costTotal:known.length===rows.length?known.reduce((s,r)=>s+r.cost,0):null,costKnownSubtotal:known.reduce((s,r)=>s+r.cost,0),costKnownRuns:known.length,metrics:Object.fromEntries(['contentErrors','renderDefects','interventions','elapsedSeconds','tokens'].map(k=>[k,{knownRuns:rows.filter(r=>r[k]!==null).length,total:rows.every(r=>r[k]!==null)?rows.reduce((s,r)=>s+r[k],0):null}]))};
  });
}
export function createBlindPairs(runs,{seed=1}={}){
  validate(runs);if(!Number.isInteger(seed))throw Error('Seed must be an integer');
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const reviewerPackage=[],privateMapping=[];
  for(const {rows} of group(runs,[...controlFields,'caseId','repetition','seed'])){
    if(rows.length!==2||rows[0].condition===rows[1].condition)throw Error('Each paired control group needs exactly two distinct conditions');
    const ordered=rows.slice().sort((a,b)=>a.runId.localeCompare(b.runId));if(random()<.5)ordered.reverse();
    const pairId=`pair-${String(reviewerPackage.length+1).padStart(4,'0')}`,pair={pairId,caseId:rows[0].caseId,A:null,B:null};
    for(const [i,r] of ordered.entries()){const side=i===0?'A':'B';if(r.finalDeliverable&&r.outputPath)pair[side]=`${pairId}-${side}.mp4`;privateMapping.push({pairId,side,runId:r.runId,condition:r.condition,model:r.model,sourceCommit:r.sourceCommit,sourcePath:r.outputPath,target:pair[side]});}
    reviewerPackage.push(pair);
  }
  return {reviewerPackage,privateMapping};
}
export async function writeBlindPackage(runs,{seed=1,outputDir}){
  const data=createBlindPairs(runs,{seed});await mkdir(outputDir); // Existing output is never overwritten.
  const reviewDir=join(outputDir,'reviewer');await mkdir(reviewDir);
  for(const item of data.privateMapping)if(item.target)await copyFile(resolve(item.sourcePath),join(reviewDir,item.target));
  await writeFile(join(reviewDir,'pairs.json'),JSON.stringify(data.reviewerPackage,null,2));
  await writeFile(join(outputDir,'private-mapping.json'),JSON.stringify(data.privateMapping,null,2),{mode:0o600});
  return data;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{const runs=(await readFile(process.argv[2],'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse);console.log(JSON.stringify(summarizeRuns(runs),null,2));}catch(e){console.error(e.message);process.exitCode=2;}
}
