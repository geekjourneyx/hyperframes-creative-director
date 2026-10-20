import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// Original mono PCM fixture: no external samples or audio runtime dependency.
export function studyAudio(variant = 'strong') {
  if (!['strong','weak'].includes(variant)) throw Error('variant must be strong or weak');
  const rate = 48000, length = rate * 6;
  const wav = Buffer.alloc(44 + length * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length-8,4); wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22);
  wav.writeUInt32LE(rate,24); wav.writeUInt32LE(rate*2,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34);
  wav.write('data',36); wav.writeUInt32LE(length*2,40);
  const anchors = variant === 'strong' ? [2.4] : [.4,1,1.6,2.2,2.8,3.4,4,4.6];
  for (let i=0;i<length;i++) {
    const t=i/rate;
    let sample=0;
    for (const anchor of anchors) {
      const age=t-anchor;
      if(age>=0 && age<1) sample+=.45*Math.sin(2*Math.PI*180*age)*Math.min(1,age/.005)*Math.exp(-age*9)*(1-age);
    }
    wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),44+i*2);
  }
  return wav;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [output,variant='strong',...extra] = process.argv.slice(2);
  if (!output || extra.length) throw Error('Usage: node make-audio.mjs OUTPUT.wav [strong|weak]');
  await writeFile(output,studyAudio(variant),{flag:'wx'});
}
