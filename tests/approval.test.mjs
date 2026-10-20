import test from 'node:test';import assert from 'node:assert/strict';import {readFile,writeFile,appendFile,unlink,symlink} from 'node:fs/promises';import {join} from 'node:path';
import {film,confirmation,keyReview} from './helpers.mjs';
import {readKeyframes,readSpecification,submitBrief,recordApproval,checkApproval,digestBrief} from '../skills/hyperframes-creative-director/scripts/approval.mjs';
test('approved brief is bound to text and actual image bytes, not implementation',async()=>{
 const root=await film();const s=await submitBrief(root);assert.equal(s.phase,'awaiting_approval');
 assert.equal((await checkApproval(root)).ok,false);
 const d=await digestBrief(root,readKeyframes(await readFile(join(root,'BRIEF.md'),'utf8')));await keyReview(root,d);
 await recordApproval(root,confirmation);assert.equal((await checkApproval(root)).ok,true);
 await writeFile(join(root,'animation.js'),'changed code');assert.equal((await checkApproval(root)).ok,true);
 await appendFile(join(root,'BRIEF.md'),'new copy');assert.equal((await checkApproval(root)).ok,false);
});
test('changing keyframe bytes or deleting image invalidates approval',async()=>{
 const root=await film();await submitBrief(root);await keyReview(root,await digestBrief(root));await recordApproval(root,confirmation);
 await appendFile(join(root,'keyframes/open.png'),'changed');assert.equal((await checkApproval(root)).ok,false);
 await unlink(join(root,'keyframes/open.png'));assert.equal((await checkApproval(root)).ok,false);
});
test('requires actual user evidence and current visual review',async()=>{
 const root=await film();await submitBrief(root);
 await assert.rejects(recordApproval(root,confirmation));await keyReview(root,await digestBrief(root));
 for(const c of [{...confirmation,actor:'agent'},{...confirmation,text:''},{...confirmation,sourceRef:''},{...confirmation,at:'nope'}])await assert.rejects(recordApproval(root,c));
 await recordApproval(root,confirmation);
});
test('rejects missing, malformed, duplicate or out-of-range keyframes and fake images',async()=>{
 const root=await film();const original=await readFile(join(root,'BRIEF.md'),'utf8');
 for(const b of [original.replace('| opening | 0 | keyframes/open.png | rendered |',''),original.replace('| opening | 0 |','| opening | -1 |'),original.replace('| opening | 0 |','| opening | 3 |'),original.replace('## Approval','| opening | 1 | keyframes/open.png | concept |\n## Approval'),original.replace('keyframes/open.png','../escape.png')]){
  await writeFile(join(root,'BRIEF.md'),b);await assert.rejects(submitBrief(root));
 }
 await writeFile(join(root,'BRIEF.md'),original);await writeFile(join(root,'keyframes/open.png'),'not a png');await assert.rejects(submitBrief(root));
});
test('concept frames allowed; broken state and external symlinks fail closed',async()=>{
 const root=await film();let text=await readFile(join(root,'BRIEF.md'),'utf8');await writeFile(join(root,'BRIEF.md'),text.replace('rendered','concept'));await submitBrief(root);
 await writeFile(join(root,'.director/state.json'),'broken');assert.equal((await checkApproval(root)).ok,false);
 await unlink(join(root,'keyframes/open.png'));await symlink('/etc/hosts',join(root,'keyframes/open.png'));await assert.rejects(submitBrief(root));
});
test('rejects invalid format metadata without inventing defaults',()=>{
 for(const x of ['','---\nwidth: NaN\n---','---\nwidth: 0\nheight: 1080\nfps: 30\ndurationSeconds: 30\naudioRequired: false\n---'])assert.throws(()=>readSpecification(x));
});
test('brief permits unrelated metadata and comments without weakening format checks',async()=>{
 const root=await film();const text=await readFile(join(root,'BRIEF.md'),'utf8');
 const extended=text.replace('width: 640','title: "A focus timer launch"\nworkflow: general-video\ntags:\n  - launch\nwidth: "640" # output pixels');
 assert.deepEqual(readSpecification(extended),readSpecification(text));
 assert.throws(()=>readSpecification(extended.replace('height: 360','width: 640\nheight: 360')));
 assert.throws(()=>readSpecification(extended.replace('fps: 30','fps: fast')));
});
test('stored approvals require complete confirmation and current visual review',async()=>{
 const root=await film();await submitBrief(root);await keyReview(root,await digestBrief(root));const good=await recordApproval(root,confirmation);
 for(const mutate of [s=>delete s.approval.confirmation.text,s=>delete s.approval.confirmation.sourceRef,s=>s.approval.confirmation.at=42,s=>delete s.approval.keyframeReview,s=>s.approval.keyframeReview.inspected=[],s=>s.approval.keyframeReview.briefDigest='wrong',s=>s.approval.keyframes=[]]){
  const value=structuredClone(good);mutate(value);await writeFile(join(root,'.director/state.json'),JSON.stringify(value));assert.equal((await checkApproval(root)).ok,false);
 }
});
test('stale approval returns to awaiting approval and requires resubmission',async()=>{
 const root=await film();await submitBrief(root);await keyReview(root,await digestBrief(root));await recordApproval(root,confirmation);
 await appendFile(join(root,'BRIEF.md'),'Changed claim');assert.equal((await checkApproval(root)).ok,false);
 assert.equal(JSON.parse(await readFile(join(root,'.director/state.json'),'utf8')).phase,'awaiting_approval');
 await assert.rejects(recordApproval(root,confirmation),/submit|changed/i);
});
