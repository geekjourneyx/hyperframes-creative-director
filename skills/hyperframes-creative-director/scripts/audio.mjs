import {run as defaultRun} from './io.mjs';

export function parseLoudnorm(text) {
  // loudnorm emits a flat JSON object among stderr diagnostics. Prefer its last report.
  const reports = String(text).match(/\{[^{}]*\}/g) || [];
  const finite = value => (typeof value === 'number' ||
    (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value.trim()))) && Number.isFinite(Number(value));
  for (const report of reports.reverse()) {
    let data; try { data = JSON.parse(report); } catch { continue; }
    if (!Object.hasOwn(data,'input_i') || !Object.hasOwn(data,'input_tp')) continue;
    if (!finite(data.input_i) || !finite(data.input_tp)) return null;
    return {integratedLufs:Number(data.input_i),truePeakDbtp:Number(data.input_tp)};
  }
  return null;
}

export async function measureAudio({videoPath, hasAudio = true, run = defaultRun}) {
  const empty = {integratedLufs:null,truePeakDbtp:null};
  if (!hasAudio) return {status:'not-applicable',...empty,reason:'No audio stream'};
  const args = ['-hide_banner','-nostdin','-nostats','-i',videoPath,'-map','0:a:0','-vn','-sn','-dn',
    '-af','loudnorm=print_format=json','-f','null','-'];
  let raw;
  try { raw = await run('ffmpeg',args); }
  catch (error) { return {status:'unverified',...empty,reason:`Audio measurement unavailable: ${error.message}`}; }
  if (raw.code !== 0) return {status:'unverified',...empty,reason:raw.code===127?'FFmpeg unavailable':'FFmpeg measurement failed',raw};
  const metrics = parseLoudnorm(raw.stderr);
  if (!metrics) return {status:'unverified',...empty,reason:'No finite input loudness/true-peak report (silence or malformed output)',raw};
  return {status:'measured',...metrics,reason:'First audio stream of final export; input measurements, no delivery target applied',raw};
}
