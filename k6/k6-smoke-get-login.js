import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  const response = http.get('http://127.0.0.1:3001/users/login');

  check(response, {
    'login page status is 200': (res) => res.status === 200,
    'login page response is fast': (res) =>
      res.timings.duration < 300,
  });

  sleep(1);
}