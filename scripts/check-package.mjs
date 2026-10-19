import {execFileSync} from 'node:child_process';
const pack=JSON.parse(execFileSync('npm',['pack','--dry-run','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}))[0];
const allowed=p=>p.startsWith('skills/hyperframes-creative-director/')||['package.json','README.md','LICENSE'].includes(p);
const forbidden=pack.files.map(f=>f.path).filter(p=>!allowed(p)||/superpowers|(^|\/)\.env|node_modules|eval-runs|workspaces/.test(p));
if(forbidden.length)throw Error('Unexpected packaged files: '+forbidden.join(', '));
if(!pack.files.some(f=>f.path==='skills/hyperframes-creative-director/SKILL.md'))throw Error('Skill entry is missing');
if(execFileSync('git',['ls-files','docs/superpowers','.superpowers'],{encoding:'utf8'}).trim())throw Error('Private planning is tracked');
execFileSync('git',['check-ignore','docs/superpowers/plans/example.md'],{stdio:'pipe'});
console.log(`Package boundary passed: ${pack.files.length} allowed files; private planning is ignored and untracked.`);
