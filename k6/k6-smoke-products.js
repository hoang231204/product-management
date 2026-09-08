import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Cấu hình bài test mô phỏng lượng người dùng thực tế (Ramping Load Test)
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Tăng dần từ 0 lên 10 người dùng trong 10 giây đầu
    { duration: '30s', target: 50 }, // Đẩy mạnh lên 50 người dùng đồng thời (Peak Load) trong 30 giây tiếp theo
    { duration: '10s', target: 0 },  // Giảm dần tải về 0 trong 10 giây cuối
  ],
  thresholds: {
    // Tiêu chuẩn khắt khe để pass bài test:
    http_req_failed: ['rate<0.01'],   // Tỷ lệ lỗi phải nhỏ hơn 1%
    http_req_duration: ['p(95)<300'], // 95% số lượng request phải phản hồi dưới 300ms (cực kỳ mượt)
  },
};

// 2. Hành vi của Người dùng ảo (Virtual User)
export default function () {
  // Gửi request đến trang chủ (Home Page) của hệ thống e-commerce
  const response = http.get('http://127.0.0.1:3001/');

  // Kiểm tra tính chính xác và hiệu năng của từng request
  check(response, {
    'home page status is 200': (r) => r.status === 200,
    'response time is fast (< 250ms)': (r) => r.timings.duration < 250,
  });

  // Tạm nghỉ 1 giây giữa các hành động để mô phỏng người dùng thật duyệt web
  sleep(1);
}