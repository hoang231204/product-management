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
    'http_req_failed{route:products-page-1}': ['rate<0.01'],
    'http_req_duration{route:products-page-1}': ['p(95)<500'],

    'http_req_failed{route:products-page-2}': ['rate<0.01'],
    'http_req_duration{route:products-page-2}': ['p(95)<500'],
  },
};

export default function () {
  const page = Math.random() < 0.5 ? 1 : 2;

  const response = http.get(
    `${BASE_URL}/products?page=${page}`,
    {
      tags: {
        route: `products-page-${page}`,
      },
    }
  );

  check(response, {
    'product page status is 200': (res) => res.status === 200,
    'product page contains products layout': (res) =>
      res.body.includes('product-item') ||
      res.body.includes('Không có sản phẩm nào'),
    'product page response is fast': (res) =>
      res.timings.duration < 500,
  });

  sleep(1);
}