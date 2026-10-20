import {mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {run as defaultRun,fileHash,check,DirectorError,inside,writeJSON} from './io.mjs';
import {measureAudio} from './audio.mjs';

export const requiredChecks=['decode','video_track','dimensions','frame_rate','duration','audio_presence'];
export const rational=value=>{const [a,b=1]=String(value).split('/').map(Number);return b? a/b:NaN;};
export function validateExpectation(e){
  for(const name of ['width','height','fps','durationSeconds'])if(!Number.isFinite(e?.[name])||e[name]<=0)throw new DirectorError('Invalid render expectation: '+name);
  if(typeof e.audioRequired!=='boolean')throw new DirectorError('audioRequired must be boolean');
  for(const name of ['keyframeTimes','cutTimes'])for(const t of e[name]??[])if(!Number.isFinite(t)||t<0||t>=e.durationSeconds)throw new DirectorError('Invalid sample time');
}
export async function inspectVideo({videoPath,expectation,outputDir,run=defaultRun,measureAudioMetrics=true}){
  validateExpectation(expectation);
  const video=resolve(videoPath),hash=await fileHash(video);
  const base=resolve(outputDir);await mkdir(base,{recursive:true});
  const dir=await inside(base,hash.slice(0,12),{missing:true});await mkdir(dir,{recursive:true});
  const result={schemaVersion:1,videoPath:video,videoSha256:hash,expectation,hasAudio:null,checks:[],artifacts:[]};
  const add=(id,status,reason,evidence=[],range)=>result.checks.push(check(id,status,reason,evidence,range));
  const probe=await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',video]);
  if(probe.code!==0){for(const id of requiredChecks)add(id,probe.code===127?'unverified':'fail',probe.code===127?'ffprobe unavailable':'Cannot parse media; check the local file');return result;}
  let info;try{info=JSON.parse(probe.stdout);}catch{throw new DirectorError('ffprobe returned invalid JSON',3);}
  const stream=info.streams?.find(s=>s.codec_type==='video');
  result.hasAudio=!!info.streams?.some(s=>s.codec_type==='audio');
  // Optional metadata never changes requiredChecks or delivery readiness.
  const measurement=(!result.hasAudio||measureAudioMetrics)
    ? await measureAudio({videoPath:video,hasAudio:result.hasAudio,run})
    : {status:'unverified',integratedLufs:null,truePeakDbtp:null,reason:'Optional measurement disabled'};
  const {raw,...metrics}=measurement;
  result.audioMetrics=metrics;
  if(raw){
    const path=await inside(base,join(dir,'audio-measurement.json'),{missing:true});
    await writeJSON(base,path,{videoSha256:hash,stream:'0:a:0',metrics,raw});
    result.audioMeasurement={path,sha256:await fileHash(path)};
  }
  add('video_track',stream?'pass':'fail',stream?'Video stream found':'No video stream',[video]);
  add('audio_presence',expectation.audioRequired&&!result.hasAudio?'fail':'pass',result.hasAudio?'Audio stream found':'No audio stream',[video]);
  const decode=await run('ffmpeg',['-v','error','-xerror','-i',video,'-f','null','-']);
  add('decode',decode.code===127?'unverified':decode.code===0?'pass':'fail',decode.code===0?'All streams decoded':'Full decode did not succeed',[video]);
  if(!stream){for(const id of ['dimensions','frame_rate','duration'])add(id,'fail','No video stream');return result;}
  add('dimensions',stream.width===expectation.width&&stream.height===expectation.height?'pass':'fail',`Actual ${stream.width}x${stream.height}; expected ${expectation.width}x${expectation.height}`,[video]);
  const fps=rational(stream.avg_frame_rate),duration=Number(stream.duration??info.format?.duration);
  add('duration',Number.isFinite(duration)&&Math.abs(duration-expectation.durationSeconds)<=1/expectation.fps+.001?'pass':'fail',`Actual ${duration}s; expected ${expectation.durationSeconds}s`,[video]);
  const frames=await run('ffprobe',['-v','error','-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time','-of','json',video]);
  let timestamps=[];
  if(frames.code===0){try{timestamps=JSON.parse(frames.stdout).frames.map(f=>Number(f.best_effort_timestamp_time));}catch{}}
  const constant=timestamps.length>1&&timestamps.every((t,i)=>Number.isFinite(t)&&(!i||Math.abs(t-timestamps[i-1]-1/expectation.fps)<.0002));
  add('frame_rate',frames.code!==0?'unverified':Math.abs(fps-expectation.fps)<.001&&constant?'pass':'fail',`Average ${fps} fps; frame timestamps ${constant?'match':'do not confirm'} expected CFR ${expectation.fps}`,[video]);
  if(decode.code!==0||!Number.isFinite(duration)||duration<=0||!Number.isFinite(fps)||fps<=0)return result;
  const last=timestamps.length?timestamps.at(-1)-timestamps[0]:Math.max(0,duration-1/fps);
  const times=[0,...expectation.keyframeTimes??[],...(expectation.cutTimes??[]).flatMap(t=>[t-1/fps,t]),last];
  const samples=[...new Set(times.map(t=>Math.max(0,Math.min(last,t)).toFixed(6)))];
  for(const t of samples){
    const path=await inside(base,join(dir,`frame-${t}.png`),{missing:true});
    const r=await run('ffmpeg',['-v','error','-y','-i',video,'-ss',t,'-frames:v','1','-threads','1',path]);
    if(r.code===0)result.artifacts.push(path);else add('frame_'+t,'unverified','Frame extraction failed');
  }
  // Continuous excerpts retain motion and sound on both sides of cuts.
  for(const t of [...new Set([...(expectation.cutTimes??[]),...(expectation.keyframeTimes??[]),duration/2])]){
    const start=Math.max(0,t-.5),length=Math.min(duration-start,1);
    const path=await inside(base,join(dir,`clip-${t.toFixed(6)}.mp4`),{missing:true});
    const r=await run('ffmpeg',['-v','error','-y','-i',video,'-ss',String(start),'-t',String(length),'-map','0:v:0','-map','0:a?','-c:v','libx264','-threads','1','-c:a','aac',path]);
    if(r.code===0)result.artifacts.push(path);else add('clip_'+t,'unverified','Continuous excerpt extraction failed');
  }
  const scan=await run('ffmpeg',['-hide_banner','-i',video,'-vf','blackdetect=d=0.08:pix_th=0.10',...(result.hasAudio?['-af','silencedetect=noise=-50dB:d=0.2,volumedetect']:[]),'-f','null','-']);
  if(scan.code!==0)add('signal_scan','unverified','Black/silence/peak scan failed');
  else{
    for(const [i,m] of [...scan.stderr.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].entries())add('black_'+i,'candidate','Dark interval needs contextual review',[video],[Number(m[1]),Number(m[2])]);
    let silenceStart=null,silenceIndex=0;
    const finishSilence=end=>{
      if(silenceStart!==null&&end>silenceStart)add('silence_'+silenceIndex++,'candidate','Silence may be intentional; listen in context',[video],[silenceStart,end]);
      silenceStart=null;
    };
    for(const m of scan.stderr.matchAll(/silence_(start|end):\s*(-?[\d.]+)/g)){
      const time=Math.max(0,Math.min(duration,Number(m[2])));
      if(m[1]==='start')silenceStart=time;else finishSilence(time);
    }
    if(silenceStart!==null)finishSilence(duration);
    const peak=scan.stderr.match(/max_volume: ([-\d.]+) dB/);
    if(peak&&Number(peak[1])>=-.1)add('audio_peak','candidate','Near-full-scale peak; check audible distortion',[video]);
  }
  return result;
}
export function validateSources(entries){
  if(!Array.isArray(entries))return ['Sources must be an array'];
  return entries.flatMap((entry,i)=>{
    const issues=[];
    for(const key of ['path','source','license','evidence'])if(typeof entry?.[key]!=='string'||!entry[key].trim())issues.push(`Source ${i}: missing ${key}`);
    if(entry?.permission!=='resolved')issues.push(`Source ${i}: permission unresolved`);
    if(typeof entry?.path==='string'&&(entry.path.startsWith('/')||entry.path.split(/[\\/]/).includes('..')))issues.push(`Source ${i}: invalid relative path`);
    return issues;
  });
}
