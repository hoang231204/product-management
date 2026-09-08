import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:3001';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const response = http.get(
    `${BASE_URL}/search?keyword=${encodeURIComponent('hoa')}`
  );

  check(response, {
    'search status is 200': (res) => res.status === 200,
    'search response is fast': (res) =>
      res.timings.duration < 500,
  });

  sleep(1);
}