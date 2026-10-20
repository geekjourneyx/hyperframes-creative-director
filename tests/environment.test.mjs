import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,readFile,symlink} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {probeEnvironment,initWorkspace} from '../skills/hyperframes-creative-director/scripts/environment.mjs';
const temp=()=>mkdtemp(join(tmpdir(),'director-env-'));
test('doctor distinguishes CLI, official skills and missing browser without downloading',async()=>{
 const root=await temp();const calls=[];
 const run=async(bin,args)=>{calls.push([bin,args]);return {code:0,stdout:bin==='node'?'v22.0.0':'tool 1.0',stderr:''}};
 const r=await probeEnvironment({workspace:root,home:root,run});
 assert.equal(r.checks.find(x=>x.id==='node').status,'pass');
 assert.equal(r.checks.find(x=>x.id==='official_skills').status,'unverified');
 assert.ok(!calls.some(([b])=>b==='npx'));assert.equal(r.checks.find(x=>x.id==='gpu').status,'unverified');
});
test('Node 20 fails requirements and unavailable binaries are reported',async()=>{
 const r=await probeEnvironment({workspace:await temp(),run:async b=>({code:b==='node'?0:127,stdout:b==='node'?'v20.1.0':'',stderr:'missing'})});
 assert.equal(r.checks.find(x=>x.id==='node').status,'fail');assert.equal(r.checks.find(x=>x.id==='ffprobe').status,'fail');
});
test('local CLI and local official skill are recognized',async()=>{
 const root=await temp();await mkdir(join(root,'node_modules/.bin'),{recursive:true});await writeFile(join(root,'node_modules/.bin/hyperframes'),'');
 await mkdir(join(root,'.agents/skills/hyperframes'),{recursive:true});await writeFile(join(root,'.agents/skills/hyperframes/SKILL.md'),'official');
 const r=await probeEnvironment({workspace:root,home:root,run:async b=>({code:b==='hyperframes'?127:0,stdout:b==='node'?'v24.0.0':'0.8',stderr:''})});
 assert.equal(r.checks.find(x=>x.id==='hyperframes').status,'pass');assert.equal(r.checks.find(x=>x.id==='official_skills').status,'pass');
});
test('initialization preserves a literal Chinese, spaced shell-like name',async()=>{
 const parent=await temp();let called;const name='我的影片 $(echo unsafe)';
 const r=await initWorkspace({parent,name,run:async(...args)=>{called=args;await mkdir(join(parent,name));return {code:0,stdout:'',stderr:''}}});
 assert.equal(r.root,join(parent,name));assert.deepEqual(called,['npx',['hyperframes','init',name],{cwd:parent}]);
});
test('rejects traversal, absolute names, existing directories and symlinks without overwriting',async()=>{
 const parent=await temp();await mkdir(join(parent,'existing'));await writeFile(join(parent,'existing/keep'),'original');await symlink(join(parent,'existing'),join(parent,'link'));
 for(const name of ['../other','/tmp/other','existing','link','--help','.'])await assert.rejects(initWorkspace({parent,name,run:()=>assert.fail('must not execute')}));
 assert.equal(await readFile(join(parent,'existing/keep'),'utf8'),'original');
});
