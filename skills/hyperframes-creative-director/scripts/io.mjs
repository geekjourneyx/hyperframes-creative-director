import {spawn} from 'node:child_process';
import {realpath,lstat,mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve,relative,dirname,isAbsolute} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
export class DirectorError extends Error {constructor(message,exitCode=2){super(message);this.exitCode=exitCode;}}
export async function run(bin,args,{cwd=process.cwd(),timeout=120000,maxOutput=8*1024*1024}={}){
 return new Promise(resolveResult=>{
  const child=spawn(bin,args,{cwd,shell:false,stdio:['ignore','pipe','pipe']});let stdout='',stderr='',size=0,reason='';
  const timer=setTimeout(()=>{reason='Process timed out';child.kill('SIGKILL')},timeout);timer.unref();
  for(const [stream,key] of [[child.stdout,'out'],[child.stderr,'err']])stream?.on('data',b=>{
   size+=b.length;if(size>maxOutput){reason='Process output exceeded limit';child.kill('SIGKILL');return;}
   if(key==='out')stdout+=b;else stderr+=b;
  });
  child.on('error',e=>{clearTimeout(timer);resolveResult({code:127,stdout,stderr:e.message})});
  child.on('close',code=>{clearTimeout(timer);resolveResult({code:code??1,stdout,stderr:reason||stderr})});
 });
}
export const sha256=data=>createHash('sha256').update(data).digest('hex');
export async function fileHash(path){return sha256(await readFile(path));}
export async function exists(path){try{await lstat(path);return true}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export async function inside(root,path,{missing=false}={}){
 const base=await realpath(root);const target=resolve(base,path);
 const contained=p=>{const r=relative(base,p);return r===''||(!r.startsWith('..'+ '/')&&r!=='..'&&!isAbsolute(r));};
 if(!contained(target))throw new DirectorError('Path escapes workspace');
 let current=target;
 while(!(await exists(current))){if(!missing)throw new DirectorError('Required file is missing: '+path);const parent=dirname(current);if(parent===current)throw new DirectorError('Invalid path');current=parent;}
 const actual=await realpath(current);if(!contained(actual))throw new DirectorError('Symlink escapes workspace');
 return target;
}
export async function readJSON(path){try{return JSON.parse(await readFile(path,'utf8'))}catch(e){throw new DirectorError('Cannot read JSON: '+path+' ('+e.message+')')}}
export async function writeJSON(root,path,value){
 const target=await inside(root,path,{missing:true});await mkdir(dirname(target),{recursive:true});
 const temporary=target+'.'+randomUUID()+'.tmp';await writeFile(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx'});await rename(temporary,target);
}
export const check=(id,status,reason,evidence=[],range)=>({id,status,reason,evidence,...(range?{range}:{})});
