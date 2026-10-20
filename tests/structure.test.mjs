import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
test('installable skill metadata, English default and approval workflow',async()=>{
 const s=await readFile(resolve(root,'skills/hyperframes-creative-director/SKILL.md'),'utf8');
 assert.match(s,/name: hyperframes-creative-director/);
 assert.match(s,/description:.*Use when/);
 assert.match(s,/English/); assert.match(s,/BRIEF.md/); assert.match(s,/keyframes/);
 assert.match(s,/user.*approv/i);
 assert.ok(!/[\u4e00-\u9fff]/u.test(s));
});
test('all relative skill documentation links resolve',async()=>{
 const base=resolve(root,'skills/hyperframes-creative-director');
 async function walk(dir){for(const x of await readdir(dir,{withFileTypes:true})){
  const f=resolve(dir,x.name);if(x.isDirectory())await walk(f);
  else if(f.endsWith('.md')){const s=await readFile(f,'utf8');for(const m of s.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)){
   if(!m[1].includes('://')) assert.ok((await stat(resolve(dirname(f),m[1]))).isFile(),m[1]);
  }}
 }} await walk(base);
});
test('package uses public allowlist and excludes private plans',async()=>{
 const p=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
 assert.equal(p.engines.node,'>=22'); assert.ok(p.files.includes('skills/'));
 assert.ok(!p.files.some(x=>/docs|workspaces|eval-runs|\*/.test(x)));
});
test('skill UI metadata names the skill and supplies a usable invocation',async()=>{
 const s=await readFile(resolve(root,'skills/hyperframes-creative-director/agents/openai.yaml'),'utf8');
 assert.match(s,/display_name: "HyperFrames Creative Director"/);
 const description=s.match(/short_description: "([^"]+)"/)?.[1];assert(description?.length>=25&&description.length<=64);
 assert.match(s,/default_prompt: "Use \$hyperframes-creative-director /);
 assert(!/icon_|brand_color:/.test(s),'Do not invent visual branding');
});
