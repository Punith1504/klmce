const {test}=require('node:test'),assert=require('node:assert/strict'),braces=require('braces');
for(const method of ['parse','compile','expand','stringify']) {
 for(const [open,close] of [['{','}'],['(',')']])test(`${method} rejects deeply nested ${open} without stack exhaustion`,()=>{
   assert.throws(()=>braces[method](open.repeat(3500)+'x'+close.repeat(3500)),e=>e instanceof SyntaxError && e.code==='ERR_BRACES_DEPTH');
 });
}
for(const method of ['compile','expand','stringify'])test(`${method} rejects direct deep AST`,()=>{
 let ast={type:'text',value:'x'};for(let i=0;i<200;i++)ast={type:'root',nodes:[ast]};
 assert.throws(()=>braces[method](ast),e=>e.code==='ERR_BRACES_DEPTH');
});
test('ordinary file globs and nested ranges retain their meaning',()=>{
 assert.deepEqual(braces.expand('src/{app,lib}/{a,{b,c}}.{ts,tsx}'),['src/app/a.ts','src/app/a.tsx','src/app/b.ts','src/app/b.tsx','src/app/c.ts','src/app/c.tsx','src/lib/a.ts','src/lib/a.tsx','src/lib/b.ts','src/lib/b.tsx','src/lib/c.ts','src/lib/c.tsx']);
 assert.deepEqual(braces.expand('{1..3}'),['1','2','3']);
 assert.equal(braces.stringify(braces.parse('src/{a,b}.ts')),'src/{a,b}.ts');
});
