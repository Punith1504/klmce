const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');

function harness(session={userId:'synthetic',getToken:async()=> 'synthetic-clerk-token'}) {
  const calls=[];
  class NextResponse extends Response {
    static json(value,init){return new NextResponse(JSON.stringify(value),init);}
  }
  const context={exports:{},process:{env:{ERP_API_URL:'https://backend.example.test/api/v1'}},
    AbortSignal,TextDecoder,require(name){
      if(name==='@clerk/nextjs/server')return{auth:async()=>session};
      if(name==='next/server')return{NextResponse};
      throw new Error(name);
    },fetch:async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({mode:'TEST'}),{status:200});}};
  const source=fs.readFileSync('src/app/api/erp/[...path]/route.ts','utf8');
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
  async function send(path,headers={},body){
    const request=new Request('https://erp.example.test/api/erp/'+path,{method:'POST',
      headers:{Origin:'https://erp.example.test',...headers},body});
    request.nextUrl=new URL(request.url);
    return context.exports.POST(request,{params:Promise.resolve({path:path.split('/')})});
  }
  return {send,calls};
}

test('finance proxy requires authenticated session',async()=>{
  const h=harness({userId:null});assert.equal((await h.send('finance/razorpay/invoices')).status,401);assert.equal(h.calls.length,0);
});
test('finance proxy rejects cross-origin writes',async()=>{
  const h=harness();assert.equal((await h.send('finance/razorpay/invoices',{Origin:'https://attacker.example'})).status,403);assert.equal(h.calls.length,0);
});
test('provider webhook cannot be sent through authenticated browser proxy',async()=>{
  const h=harness();assert.equal((await h.send('finance/razorpay/webhook')).status,404);assert.equal(h.calls.length,0);
});
test('unsupported legacy payment orchestrator remains unreachable',async()=>{
  const h=harness();assert.equal((await h.send('finance/payments/gateway/orchestrate')).status,404);assert.equal(h.calls.length,0);
});
test('order requests forward only Clerk bearer to fixed backend',async()=>{
  const h=harness();assert.equal((await h.send('finance/razorpay/invoices/test/order',{Cookie:'access_token=attacker'})).status,200);
  assert.equal(h.calls[0].url,'https://backend.example.test/api/v1/finance/razorpay/invoices/test/order');
  assert.equal(h.calls[0].options.headers.Authorization,'Bearer synthetic-clerk-token');
  assert.equal(h.calls[0].options.headers.Cookie,undefined);
  assert.equal(h.calls[0].options.redirect,'error');
});
test('oversized finance request is rejected before upstream call',async()=>{
  const h=harness();assert.equal((await h.send('finance/razorpay/invoices',{},'x'.repeat(1024*1024+1))).status,413);assert.equal(h.calls.length,0);
});
