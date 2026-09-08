import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:3001';
const EMAIL = __ENV.TEST_EMAIL;
const PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const response = http.post(
    `${BASE_URL}/users/login`,
    {
      email: EMAIL,
      password: PASSWORD,
    },
    {
      redirects: 0,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  check(response, {
    'login returns 302': (res) => res.status === 302,
    'redirects to home': (res) =>
      res.headers.Location === '/' ||
      res.headers.location === '/',
    'login response is fast': (res) =>
      res.timings.duration < 1000,
  });

  sleep(1);
}