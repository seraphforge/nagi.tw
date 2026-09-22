// Read-only guard. Use --installed after copying the prepared workflow/ignore files.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const packageDir=fileURLToPath(new URL('./',import.meta.url));
const root=resolve(packageDir,'../../..');
const expected=JSON.parse(readFileSync(join(packageDir,'staging-expected.json'),'utf8'));
for(const repo of ['parent','notes']){
 const cwd=repo==='parent'?root:join(root,'notes.nagi.tw');
 assert.equal(execFileSync('git',['-C',cwd,'diff','--cached','--name-only'],{encoding:'utf8'}).trim(),'','Index must be empty before staging');
 const list=readFileSync(join(packageDir,`staging-${repo}.txt`),'utf8').trim().split('\n');
 assert.deepEqual(list,expected.filter(e=>e.repository===repo).map(e=>e.path));
 for(const entry of expected.filter(e=>e.repository===repo)){
  assert.ok(!/(?:^|\/)(?:node_modules|dist|\.astro|\.tmp|release-preparation)(?:\/|$)/.test(entry.path));
  if(repo==='parent')assert.ok(entry.path.startsWith('nagi.tw/')||['.gitignore','.github/workflows/pages.yml'].includes(entry.path));
  const path=process.argv.includes('--installed')?resolve(cwd,entry.path):resolve(root,entry.preparedSource);
  assert.ok(!relative(root,path).startsWith('..'),'Path outside parent workspace');
  assert.equal(existsSync(path),entry.exists,entry.path+' existence');
  if(entry.exists)assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),entry.sha256,entry.path+' changed since verification');
 }
 console.log(`${repo}: ${list.length} explicit literal paths verified; index empty`);
}
