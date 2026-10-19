import {requiredChecks} from './evidence.mjs';
const text=value=>typeof value==='string'&&value.trim().length>0;
const hash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export function validateReview(review,evidence){
  const issues=[];
  if(!review||review.schemaVersion!==1)return ['Review schemaVersion must be 1'];
  if(!hash(review.briefDigest))issues.push('Missing approved brief digest');
  if(!hash(review.videoSha256)||review.videoSha256!==evidence?.videoSha256)issues.push('Review belongs to another video');
  if(!['independent','self-review'].includes(review.reviewerMode))issues.push('Invalid reviewer mode');
  if(!['verified','unverified'].includes(review.playback))issues.push('Invalid playback observation');
  if(!['verified','unverified','not-applicable'].includes(review.audio))issues.push('Invalid audio observation');
  if(evidence?.hasAudio&&review.audio==='not-applicable')issues.push('Present audio cannot be not-applicable');
  if(!Array.isArray(review.limitations)||!review.limitations.every(text))issues.push('Limitations must be strings');
  if(!Array.isArray(review.findings))return [...issues,'Findings must be an array'];
  const ids=new Set();
  for(const f of review.findings){
    if(!f||!text(f.id)||ids.has(f.id)){issues.push('Finding IDs must be unique and nonempty');continue;}ids.add(f.id);
    if(!['technical','content','visual','motion','creative'].includes(f.category)||!['blocker','major','minor'].includes(f.severity)||!['open','fixed','intentional'].includes(f.resolution))issues.push(`Invalid finding: ${f.id}`);
    if(!text(f.expected)||!text(f.observed)||!Array.isArray(f.evidence)||!f.evidence.length||!f.evidence.every(text))issues.push(`Finding lacks observation/evidence: ${f.id}`);
    if(f.range&&(!Array.isArray(f.range)||f.range.length!==2||!f.range.every(Number.isFinite)||f.range[0]<0||f.range[1]<f.range[0]))issues.push(`Invalid time range: ${f.id}`);
    if(f.resolution==='intentional'&&(!text(f.rationale)||['technical','content'].includes(f.category)))issues.push(`Cannot waive finding: ${f.id}`);
  }
  return issues;
}
export function decideDelivery({approvalValid,evidence,review}){
  const blocked=[],partial=[];
  if(!approvalValid)blocked.push('Current brief/keyframe approval is missing or stale');
  if(evidence?.schemaVersion!==1||!Array.isArray(evidence.checks)||!hash(evidence.videoSha256))blocked.push('Invalid evidence bundle');
  blocked.push(...validateReview(review,evidence));
  const checks=Array.isArray(evidence?.checks)?evidence.checks:[];
  const checkIds=new Set();
  for(const c of checks){
    if(!c||!text(c.id)||checkIds.has(c.id)||!['pass','fail','unverified','candidate'].includes(c.status)){blocked.push('Invalid or duplicated check');continue;}checkIds.add(c.id);
    if(c.status==='fail')blocked.push('Failed check: '+c.id);
    if(c.status==='unverified')partial.push('Unverified check: '+c.id);
    if(c.status==='pass'&&requiredChecks.includes(c.id)&&(!Array.isArray(c.evidence)||!c.evidence.length))partial.push('Missing check evidence: '+c.id);
    if(c.status==='candidate'&&!(Array.isArray(review?.findings)&&review.findings.some(f=>f?.id===c.id&&f.resolution==='intentional'&&text(f.rationale))))blocked.push('Current candidate needs an intentional disposition or new inspection: '+c.id);
  }
  for(const id of requiredChecks)if(!checks.some(c=>c?.id===id))partial.push('Missing check: '+id);
  if(!Array.isArray(evidence?.artifacts)||!evidence.artifacts.some(p=>typeof p==='string'&&p.endsWith('.png'))||!evidence.artifacts.some(p=>typeof p==='string'&&p.endsWith('.mp4')))partial.push('Missing extracted frame/continuous excerpt evidence');
  if(review?.playback!=='verified')partial.push('Full video playback is unverified');
  if(evidence?.hasAudio===true&&review?.audio!=='verified')partial.push('Audio listening is unverified');
  if(evidence?.hasAudio===null||evidence?.hasAudio===undefined)partial.push('Audio presence is unknown');
  for(const f of Array.isArray(review?.findings)?review.findings:[])if(f?.resolution==='open'&&(['blocker','major'].includes(f.severity)||['technical','content'].includes(f.category)))blocked.push('Unresolved finding: '+f.id);
  return {status:blocked.length?'changes_required':partial.length?'partial':'ready',reasons:[...blocked,...partial],reviewerMode:review?.reviewerMode??'unverified',limitations:Array.isArray(review?.limitations)?review.limitations:[],remainingFindings:Array.isArray(review?.findings)?review.findings.filter(f=>f?.resolution==='open'):[]};
}
