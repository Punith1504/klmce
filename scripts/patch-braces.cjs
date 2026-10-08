// Local mitigation for GHSA-vfj7-8cjw-p6xm. Preserve package identity and audit visibility.
// Fail closed if upstream source changes; do not silently patch unknown versions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const spec=require('./braces-patch.json');
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
let patched=0;
for(const name of Object.keys(lock.packages).filter(p=>/(^|\/)node_modules\/braces$/.test(p))){
 const base=path.join(root,name);
 if(!fs.existsSync(base))continue; // production-only install may exclude the dev toolchain
 if(JSON.parse(fs.readFileSync(path.join(base,'package.json'))).version!=='3.0.3')throw new Error('Review braces patch for new upstream version');
 for(const [file,entry] of Object.entries(spec.files)){
  const target=path.join(base,file),source=fs.readFileSync(target,'utf8');
  const digest=crypto.createHash('sha256').update(source).digest('hex');
  if(digest===entry.patchedSha)continue;
  if(digest!==entry.originalSha)throw new Error('Unexpected braces source: '+file);
  let output=source;
  for(const change of entry.replacements){
   if(!output.includes(change.before))throw new Error('Patch context missing: '+file);
   output=output.split(change.before).join(change.after);
  }
  if(crypto.createHash('sha256').update(output).digest('hex')!==entry.patchedSha)throw new Error('Patch checksum failed');
  fs.writeFileSync(target,output);
 }
 fs.copyFileSync(path.join(__dirname,'braces-depth-guard.cjs'),path.join(base,'lib/depth-guard.js'));
 patched++;
}
console.log(`Verified local braces depth mitigation in ${patched} installed package(s)`);
