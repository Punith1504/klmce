// Staging-only READ workload. NOT executed as part of the October audit.
// Fixture: 3,000 synthetic accounts, each with cookie and checks:
// [{cookie:"access_token=...",checks:[{path:"/actual/secured/route",field:"student_id",expected:"..."}]}]
// Use a real implemented route and exact account-specific response assertion.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

const base = __ENV.BASE_URL;
if (!base || __ENV.ALLOW_STAGING_LOAD !== 'yes' || !__ENV.PROFILES_FILE) {
  throw new Error('Set BASE_URL, PROFILES_FILE and ALLOW_STAGING_LOAD=yes for an isolated authorized staging system.');
}
const profiles = new SharedArray('synthetic-students', () => JSON.parse(open(__ENV.PROFILES_FILE)));
if (profiles.length !== 3000) throw new Error('Exactly 3,000 synthetic student profiles required');
for (const p of profiles) {
  if (!p.cookie || !p.checks?.length || p.checks.some(c => !c.path?.startsWith('/') || c.path.startsWith('//') || !c.field || c.expected === undefined)) {
    throw new Error('Every profile needs scoped relative paths and account-specific expected fields');
  }
}
export const options = {
  scenarios: {
    population: {executor:'shared-iterations', vus:50, iterations:3000, maxDuration:'10m', exec:'population'},
    sustained: {executor:'ramping-vus', startTime:'10m', startVUs:0, exec:'sustained',
      stages:[{duration:'2m',target:50},{duration:'3m',target:150},{duration:'5m',target:300},{duration:'2m',target:0}]}
  },
  thresholds: { http_req_failed:['rate<0.01'], http_req_duration:['p(95)<1500','p(99)<3000'], checks:['rate==1'] }
};
function read(profile) {
  for (const c of profile.checks) {
    const response = http.get(base.replace(/\/$/, '') + c.path, {
      headers:{Cookie:profile.cookie}, redirects:0, timeout:'10s', tags:{name:'student-read'}
    });
    let body;
    try { body = response.json(); } catch (_) { body = null; }
    check(response, {
      'authenticated read succeeds': r => r.status === 200,
      'response belongs to expected account': () => body !== null && body[c.field] === c.expected
    });
  }
}
export function population() { read(profiles[exec.scenario.iterationInTest]); }
export function sustained() { read(profiles[(exec.vu.idInTest - 1) % profiles.length]); sleep(1); }
