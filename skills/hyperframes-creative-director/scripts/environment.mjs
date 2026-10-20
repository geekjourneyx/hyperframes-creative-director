import {resolve,join,isAbsolute} from 'node:path';import {realpath,lstat} from 'node:fs/promises';import {homedir} from 'node:os';
import {run as defaultRun,exists,check,DirectorError} from './io.mjs';
export async function probeEnvironment({workspace,run=defaultRun,home=homedir()}){
 const cwd=await realpath(workspace);const checks=[],versions={};
 for(const [id,bin,args] of [['node','node',['--version']],['npm','npm',['--version']],['ffmpeg','ffmpeg',['-version']],['ffprobe','ffprobe',['-version']]]){
  const r=await run(bin,args,{cwd});versions[id]=r.code===0?r.stdout.trim().split('\n')[0]:null;
  const valid=r.code===0&&(id!=='node'||Number(r.stdout.match(/v?(\d+)/)?.[1])>=22);
  checks.push(check(id,valid?'pass':'fail',valid?versions[id]:id==='node'?'Node.js >=22 required':'Tool unavailable: '+bin));
 }
 const local=join(cwd,'node_modules/.bin/hyperframes');let cli=await run('hyperframes',['--version'],{cwd});
 if(cli.code!==0&&await exists(local))cli=await run(local,['--version'],{cwd});
 versions.hyperframes=cli.code===0?cli.stdout.trim():null;
 checks.push(check('hyperframes',cli.code===0?'pass':'unverified',cli.code===0?versions.hyperframes:'No local/global CLI found; npx may install it. Doctor does not download.'));
 const candidates=[join(cwd,'.agents/skills/hyperframes/SKILL.md'),join(cwd,'.claude/skills/hyperframes/SKILL.md'),join(home,'.agents/skills/hyperframes/SKILL.md'),join(home,'.claude/skills/hyperframes/SKILL.md')];
 const found=[];for(const p of candidates)if(await exists(p))found.push(p);
 checks.push(check('official_skills',found.length?'pass':'unverified',found.length?'Router found; verify its source/version before use.':'Official skills not found in standard locations; inspect your host skill registry.',found));
 for(const id of ['browser','fonts','gpu','disk','network'])checks.push(check(id,'unverified','Confirm '+id+' for the selected composition with the official CLI/browser before production.'));
 return {checks,versions};
}
export async function initWorkspace({parent,name,run=defaultRun}){
 if(typeof name!=='string'||!name.trim()||name.startsWith('-')||isAbsolute(name)||/[\\/]/.test(name)||name==='.'||name==='..')throw new DirectorError('Use a new single directory name');
 const cwd=await realpath(parent),root=resolve(cwd,name);
 if(await exists(root))throw new DirectorError('Target already exists; select a new workspace');
 const result=await run('npx',['hyperframes','init',name],{cwd});
 if(result.code!==0)throw new DirectorError('HyperFrames initialization failed: '+result.stderr.slice(-1500),3);
 if(!(await exists(root))||!(await lstat(root)).isDirectory()||await realpath(root)!==root)throw new DirectorError('CLI did not create the expected independent directory',3);
 return {root};
}
