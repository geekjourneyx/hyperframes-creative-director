import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const example = resolve('skills/hyperframes-creative-director/examples/seekable-canvas');
export async function sceneServer() {
  const runtime = resolve('node_modules/hyperframes/dist/hyperframe.runtime.iife.js');
  const server=createServer(async(req,res)=>{try {
    const name=new URL(req.url,'http://localhost').pathname;
    const path=name==='/runtime.js'?runtime:resolve(example,'.'+(name==='/'?'/index.html':name));
    if(path!==runtime&&!path.startsWith(example+'/'))throw Error('Outside fixture');
    res.setHeader('Content-Type',path.endsWith('.html')?'text/html':'text/javascript');
    let content=await readFile(path,'utf8');
    if(path.endsWith('.html'))content=content.replace('</body>','<script src="/runtime.js"></script></body>');
    res.end(content);
  }catch{res.writeHead(404);res.end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(r=>server.close(r))};
}
export async function launchBrowser(){return chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});}
