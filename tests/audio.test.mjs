import test from 'node:test';
import assert from 'node:assert/strict';
import {measureAudio, parseLoudnorm} from '../skills/hyperframes-creative-director/scripts/audio.mjs';
import {studyAudio} from '../skills/hyperframes-creative-director/examples/craft-studies/make-audio.mjs';

test('loudnorm reads input measurements, including the last report, not normalized output', () => {
  const report = 'prefix {unrelated}\n{"input_i":"-23.7","input_tp":"-3.2","output_i":"-24"}\n';
  assert.deepEqual(parseLoudnorm(report), {integratedLufs:-23.7,truePeakDbtp:-3.2});
  assert.deepEqual(parseLoudnorm(report+'{"input_i":"-18","input_tp":"0.2"}'), {integratedLufs:-18,truePeakDbtp:.2});
});
for (const report of ['', '{broken}', '{"input_i":"-inf","input_tp":"-inf"}', '{"input_i":null,"input_tp":"0"}', '{"input_i":"","input_tp":"0"}', '{"input_i":"-23","input_tp":"NaN"}']) {
  test(`malformed or non-finite loudness remains unverified: ${report}`, async () => {
    const result=await measureAudio({videoPath:'film.mp4',run:async()=>({code:0,stdout:'',stderr:report})});
    assert.equal(result.status,'unverified'); assert.equal(result.integratedLufs,null); assert.equal(result.truePeakDbtp,null);
  });
}
test('no audio requires no FFmpeg invocation', async () => {
  const result=await measureAudio({videoPath:'silent.mp4',hasAudio:false,run:()=>{throw Error('must not run');}});
  assert.equal(result.status,'not-applicable');
});
test('measurement uses an argument array for the exact input, never rewrites the export', async () => {
  const path='/tmp/film $(touch nope); name.mp4';
  const result=await measureAudio({videoPath:path,run:async(bin,args)=>{
    assert.equal(bin,'ffmpeg'); assert.equal(args[args.indexOf('-i')+1],path);
    assert.equal(args[args.indexOf('-map')+1],'0:a:0'); assert.deepEqual(args.slice(-3),['-f','null','-']);
    assert(!args.includes('-y'));
    return {code:0,stdout:'',stderr:'{"input_i":"-18.2","input_tp":"-1.1"}'};
  }});
  assert.equal(result.status,'measured'); assert.equal(result.integratedLufs,-18.2);
  assert.equal(result.truePeakDbtp,-1.1); assert.match(result.raw.stderr,/input_i/);
});
for (const code of [127,1]) test(`tool failure ${code} is optional and unverified`, async () => {
  const result=await measureAudio({videoPath:'film.mp4',run:async()=>({code,stdout:'',stderr:'missing or failed'})});
  assert.equal(result.status,'unverified'); assert.equal(result.integratedLufs,null);
});
test('runner exceptions remain unverified', async () => {
  assert.equal((await measureAudio({videoPath:'film.mp4',run:async()=>{throw Error('timeout');}})).status,'unverified');
});
test('sound fixture has exact authored onset, silent lead and deterministic PCM', () => {
  const wav=studyAudio('strong'); assert.deepEqual(wav,studyAudio('strong'));
  assert.equal(wav.readUInt32LE(24),48000); assert.equal((wav.length-44)/2/48000,6);
  assert(wav.subarray(44,44+Math.round(2.4*48000)*2).every(value=>value===0));
  assert(wav.subarray(44+Math.round(2.4*48000)*2,44+Math.round(2.5*48000)*2).some(value=>value!==0));
  assert.notDeepEqual(wav,studyAudio('weak')); assert.throws(()=>studyAudio('other'));
});
