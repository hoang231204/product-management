import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:3001';
const PRODUCT_SLUG = __ENV.PRODUCT_SLUG;

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],

  thresholds: {
    'http_req_failed{route:product-detail}': ['rate<0.01'],
    'http_req_duration{route:product-detail}': ['p(95)<500'],
  },
};

export default function () {
  if (!PRODUCT_SLUG) {
    throw new Error(
      'Thiếu PRODUCT_SLUG. Ví dụ: $env:PRODUCT_SLUG="hoa-hong-do"'
    );
  }

  const response = http.get(
    `${BASE_URL}/products/details/${encodeURIComponent(PRODUCT_SLUG)}`,
    {
      redirects: 0,
      tags: {
        route: 'product-detail',
      },
    }
  );

  check(response, {
    'product detail status is 200': (res) => res.status === 200,
    'product detail is not redirected': (res) => res.status !== 302,
    'product detail has response body': (res) => res.body.length > 0,
    'product detail response is fast': (res) =>
      res.timings.duration < 500,
  });

  sleep(1);
}