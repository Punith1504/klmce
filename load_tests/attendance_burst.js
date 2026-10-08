// Run only against an authorized isolated staging environment with synthetic users.
// No dummy QR or 400 response is counted as a successful attendance write.
import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';
const base=__ENV.API_URL;
if (!base || __ENV.ALLOW_STAGING_LOAD!=='yes' || !__ENV.PROFILES_FILE)
  throw new Error('Set API_URL, PROFILES_FILE and ALLOW_STAGING_LOAD=yes');
const profiles=new SharedArray('attendance-students',()=>JSON.parse(open(__ENV.PROFILES_FILE)));
if(profiles.length!==3000 || profiles.some(p=>!p.cookie || !p.qr_payload))
  throw new Error('Supply 3000 distinct synthetic sessions and freshly generated class QR payloads');
export const options={
  scenarios:{attendance:{executor:'shared-iterations',vus:300,iterations:3000,maxDuration:'25s'}},
  thresholds:{http_req_failed:['rate<0.01'],http_req_duration:['p(95)<1500','p(99)<3000'],checks:['rate==1']}
};
export default function(){
  const p=profiles[exec.scenario.iterationInTest];
  const response=http.post(base.replace(/\/$/,'')+'/attendance/scan',JSON.stringify({qr_payload:p.qr_payload}),{
    headers:{Cookie:p.cookie,Origin:__ENV.FRONTEND_URL,'Content-Type':'application/json'},redirects:0,timeout:'10s'});
  check(response,{'accepted attendance':r=>r.status===200});
}
// After the run, verify exactly one row for each expected student/slot/date and
// zero unexpected rows in PostgreSQL. Repeat identical submissions and check the
// row count remains unchanged. The scanner limit uses verified student identity,
// allowing a campus NAT to serve many students without trusting client headers.
