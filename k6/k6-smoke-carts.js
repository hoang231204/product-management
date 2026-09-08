import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:3001';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],

  thresholds: {
    'http_req_failed{route:cart-page}': ['rate<0.01'],
    'http_req_duration{route:cart-page}': ['p(95)<500'],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/carts`, {
    tags: {
      route: 'cart-page',
    },
  });

  check(response, {
    'cart page status is 200': (res) => res.status === 200,
    'cart page has response body': (res) => res.body.length > 0,
    'cart page response is fast': (res) =>
      res.timings.duration < 500,
  });

  sleep(1);
}