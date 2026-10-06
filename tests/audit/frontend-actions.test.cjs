// Executes actual TypeScript action bodies with database/cache boundaries mocked.
// This is a unit security contract suite, not a browser or real DB test.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');

function loadAction(relative, prisma) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true
  }}).outputText;
  const exports = {};
  const context = { exports, setTimeout: (fn) => fn(), console,
    require(name) {
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
