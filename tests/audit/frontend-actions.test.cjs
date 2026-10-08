// Executes actual TypeScript action bodies with database/cache boundaries mocked.
// This is a unit security contract suite, not a browser or real DB test.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');

function loadAction(relative, prisma, overrides = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true
  }}).outputText;
  const exports = {};
  const context = { exports, setTimeout: (fn) => fn(), console, process, fetch: overrides.fetch || fetch, AbortSignal,
    require(name) {
      if (name in overrides) return overrides[name];
      if (name === 'server-only') return {};
      if (name === 'zod') return require('zod');
      if (name === '@/lib/server-api') return loadAction('src/lib/server-api.ts', prisma, overrides);
      if (name === '@/lib/prisma') return prisma;
      if (name === 'next/cache') return { revalidatePath() {} };
      if (name === '@clerk/nextjs/server') return { auth: async () => ({ userId: null }), currentUser: async () => null };
      throw new Error('Unmocked boundary: ' + name);
    }
  };
  vm.runInNewContext(compiled, context, { filename: relative });
  return exports;
}

function harness(kind) {
  const writes = [];
  const model = { findFirst: async () => null, create: async arg => { writes.push(arg); return {id:'new'}; },
    update: async arg => { writes.push(arg); return {id:'old'}; } };
  const prisma = { [kind]: model, examSchedule: { findUnique: async () => ({id:'schedule', course:{}}) } };
  const action = loadAction(`src/app/(erp)/faculty/${kind === 'result' ? 'results' : 'attendance'}/actions.ts`, prisma);
  return { action, writes, model };
}

test('attendance refuses writes without verified faculty identity', async () => {
  const h = harness('attendance');
  await h.action.submitAttendance('slot', '2026-10-06', [{studentId:'other-student', status:'PRESENT'}]);
  assert.equal(h.writes.length, 0, 'Unverified caller persisted attendance');
});

test('attendance rejects arbitrary statuses', async () => {
  const h = harness('attendance');
  const result = await h.action.submitAttendance('slot', '2026-10-06', [{studentId:'s', status:'INVENTED'}]);
  assert.equal(result.success, false);
  assert.equal(h.writes.length, 0);
});

test('attendance rejects retroactive normal submission', async () => {
  const h = harness('attendance');
  const result = await h.action.submitAttendance('slot', '2000-01-01', [{studentId:'s', status:'PRESENT'}]);
  assert.equal(result.success, false);
  assert.equal(h.writes.length, 0);
});

test('empty attendance batch is rejected', async () => {
  const h = harness('attendance');
  assert.equal((await h.action.submitAttendance('slot', '2026-10-06', [])).success, false);
  assert.equal(h.writes.length, 0);
});

test('concurrent duplicate attendance has at most one insert', async () => {
  const h = harness('attendance');
  const args = ['slot', '2026-10-06', [{studentId:'s', status:'PRESENT'}]];
  await Promise.all([h.action.submitAttendance(...args), h.action.submitAttendance(...args)]);
  assert.ok(h.writes.length <= 1, 'Both requests observed absence and inserted; schema must enforce uniqueness');
});

test('results refuse writes without verified faculty identity', async () => {
  const h = harness('result');
  await h.action.submitResults('schedule', [{studentId:'s', marks:20}]);
  assert.equal(h.writes.length, 0);
});

for (const marks of [-1, 31, NaN, Infinity]) {
  test(`results reject invalid mark ${marks}`, async () => {
    const h = harness('result');
    const result = await h.action.submitResults('schedule', [{studentId:'s', marks}]);
    assert.equal(result.success, false);
    assert.equal(h.writes.length, 0);
  });
}

test('missing exam schedule is rejected', async () => {
  const h = harness('result');
  const action = loadAction('src/app/(erp)/faculty/results/actions.ts', {
    result: h.model, examSchedule: {findUnique: async () => null}
  });
  assert.equal((await action.submitResults('missing', [{studentId:'s', marks:20}])).success, false);
  assert.equal(h.writes.length, 0);
});

test('OCR does not mark an arbitrary document as parsed without evidence', async () => {
  const writes = [];
  const action = loadAction('src/app/(erp)/student/placements/actions.ts', {
    document: {update: async arg => writes.push(arg)}
  });
  await action.processDocumentOCR('someone-elses-document');
  assert.equal(writes.length, 0, 'Synthetic skills and GPA persisted to arbitrary document ID');
});

const ids = {slot:'11111111-1111-4111-8111-111111111111',student:'22222222-2222-4222-8222-222222222222'};
function connectedAction(relative, role='FACULTY', mutationStatus=200) {
  const calls=[];
  process.env.ERP_API_URL='https://api.example.test/api/v1';
  const action=loadAction(relative,{}, {
    '@clerk/nextjs/server': {auth:async()=>({userId:'user_verified',getToken:async()=> 'verified-session'})},
    fetch:async (url,init)=> {
      calls.push({url,init});
      return {ok:url.endsWith('/auth/me') || mutationStatus===200,status:mutationStatus,
        json:async()=>url.endsWith('/auth/me') ? {role,sub:'faculty',tenant_id:'tenant'} : {inserted_count:1}};
    },
  });
  return {action,calls};
}
test('verified faculty attendance reaches authenticated canonical backend',async()=>{
  const {action,calls}=connectedAction('src/app/(erp)/faculty/attendance/actions.ts');
  assert.equal((await action.submitAttendance(ids.slot,'2026-10-06',[{studentId:ids.student,status:'PRESENT'}])).success,true);
  assert.equal(calls.length,2);
  assert.ok(calls[1].url.endsWith('/attendance/roster'));
  assert.equal(calls[1].init.headers.Authorization,'Bearer verified-session');
  assert.equal(calls[1].init.cache,'no-store');
  assert.equal(JSON.parse(calls[1].init.body).records[0].studentId,ids.student);
});
test('student role cannot forward a valid faculty submission',async()=>{
  const {action,calls}=connectedAction('src/app/(erp)/faculty/attendance/actions.ts','STUDENT');
  assert.equal((await action.submitAttendance(ids.slot,'2026-10-06',[{studentId:ids.student,status:'PRESENT'}])).success,false);
  assert.equal(calls.length,1);
});
test('backend attendance conflicts do not report frontend success',async()=>{
  const {action,calls}=connectedAction('src/app/(erp)/faculty/attendance/actions.ts','FACULTY',409);
  assert.equal((await action.submitAttendance(ids.slot,'2026-10-06',[{studentId:ids.student,status:'PRESENT'}])).success,false);
  assert.equal(calls.length,2);
});
test('verified faculty can forward a valid mark edit',async()=>{
  const {action,calls}=connectedAction('src/app/(erp)/faculty/results/actions.ts');
  assert.equal((await action.updateMark(ids.student,20)).success,true);
  assert.equal(calls[1].init.method,'PUT');
  assert.equal(JSON.parse(calls[1].init.body).marks_obtained,20);
});
