import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ==========================================
// Custom Metrics & Thresholds
// ==========================================
export const scanDuration = new Trend('scan_duration');
export const successRate = new Rate('successful_scans');

export const options = {
  // Simulate 500 virtual students attempting to scan the board simultaneously
  stages: [
    { duration: '2s', target: 500 },  // Ramp up aggressively to 500 VUs
    { duration: '10s', target: 500 }, // Hold the burst for 10 seconds
    { duration: '2s', target: 0 },    // Ramp down
  ],
  thresholds: {
    // Assert 99% of scan requests complete in under 200ms
    'http_req_duration': ['p(99)<200'], 
    // Assert 99% of requests return expected 200 or 400 status codes (no 500s/crashes)
    'successful_scans': ['rate>0.99'],  
  },
};

// ==========================================
// Constants
// ==========================================
const BASE_URL = __ENV.API_URL || 'http://localhost:8000/api/v1';
const DUMMY_QR_PAYLOAD = "aes-gcm-encrypted-token-mock-for-load-test";

// ==========================================
// Virtual User Execution Loop
// ==========================================
export default function () {
  // 1. Authenticate Virtual User
  // In a real environment, you'd pull credentials from a SharedArray/CSV.
  // We simulate dynamic user IDs utilizing the native k6 VU context.
  const vuId = __VU;
  
  const authPayload = JSON.stringify({
    email: `student_${vuId}@klmce.edu`,
    password: `LoadTestPassword123!`
  });

  const authHeaders = {
    'Content-Type': 'application/json',
  };

  const authRes = http.post(`${BASE_URL}/auth/login`, authPayload, { headers: authHeaders });
  
  // Note: Depending on backend implementation, token might be an HttpOnly cookie 
  // or returned in JSON. k6 handles cookies automatically across requests in the VU context.
  let accessToken = "";
  if (authRes.status === 200 && authRes.json('access_token')) {
    accessToken = authRes.json('access_token');
  }

  // Brief jitter to mimic humans focusing cameras
  sleep(Math.random() * 0.5);

  // 2. Execute Cryptographic Handshake & Scan
  const scanPayload = JSON.stringify({
    qr_payload: DUMMY_QR_PAYLOAD,
    latitude: 28.6139,  // Mock GPS inside geofence
    longitude: 77.2090
  });

  const scanHeaders = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }) // Attach JWT if not strictly cookie-based
  };

  const scanRes = http.post(`${BASE_URL}/attendance/scan`, scanPayload, { headers: scanHeaders });

  // 3. Evaluate Assertions
  // A 200 OK means successful recording.
  // A 400/409 means "Already Scanned" or "Expired" which is valid business logic.
  // We strictly want to avoid 500s, 502s, or 504s which indicate pool saturation or Redis lock failures.
  const isSuccess = check(scanRes, {
    'is status 200 or 400': (r) => r.status === 200 || r.status === 400 || r.status === 409,
    'no internal server errors': (r) => r.status !== 500 && r.status !== 503,
  });

  successRate.add(isSuccess);
  scanDuration.add(scanRes.timings.duration);
}
