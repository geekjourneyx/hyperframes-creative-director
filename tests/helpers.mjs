import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';
export async function film(){const root=await mkdtemp(join(tmpdir(),'director-film-'));await mkdir(join(root,'keyframes'));
 execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=red:s=64x64','-frames:v','1','-threads','1',join(root,'keyframes/open.png')]);
 const brief='---\nwidth: 640\nheight: 360\nfps: 30\ndurationSeconds: 2\naudioRequired: false\n---\n# Film\nEnglish copy.\n## Keyframes\n| ID | Time | Path | Kind |\n| --- | --- | --- | --- |\n| opening | 0 | keyframes/open.png | rendered |\n## Approval\nApprove these frames.\n';
 await writeFile(join(root,'BRIEF.md'),brief);return root;}
export const confirmation={actor:'user',text:'I approve this brief and the displayed keyframes.',at:'2026-10-19T07:00:00Z',sourceRef:'test-fixture:approval'};
export async function keyReview(root,digest){await mkdir(join(root,'.director'),{recursive:true});await writeFile(join(root,'.director/keyframe-review.json'),JSON.stringify({briefDigest:digest,inspected:['opening'],reviewer:'test-fixture',status:'pass',findings:[]}));}
