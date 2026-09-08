# Product Management

> A full-stack server-rendered ecommerce platform for managing products, orders, customers, content, and operations from a permission-based admin dashboard.

This repository contains the `product-management` application. It is a server-rendered Node.js application; it does not require a separate frontend build step.

Product Management is built with **Node.js**, **Express 5**, **MongoDB**, **Redis**, and **Pug**. The project models a practical commerce workflow end to end: a customer can discover products, manage a cart, place a COD or VNPay order, and track it; an administrator can manage the catalog, users, roles, content, settings, inventory, and order lifecycle.

## Project Highlights

- Full customer storefront and protected admin dashboard rendered with Pug.
- End-to-end commerce workflow: catalog, cart, checkout, payment, orders, inventory, and content.
- Role-based access control with granular permissions for admin operations.
- Integrations for Redis, Cloudinary, SMTP email, and VNPay sandbox payments.
- Modular MVC structure with separate routes, controllers, models, middleware, validations, and helpers.

## Security & Performance

- Short-lived JWT access tokens with HTTP-only refresh-token cookies and token rotation.
- Role and permission checks protect admin routes and operations.
- `express-validator`, `sanitize-html`, escaped Pug output, and controlled Mongoose queries reduce injection and XSS risk.
- Helmet provides security headers and a configured Content Security Policy.
- Redis cache-aside reads and explicit invalidation improve product-read performance.
- Checkout uses MongoDB transactions, conditional stock updates, and recent-order checks to reduce overselling and duplicate orders.
- A Redis-backed upload counter limits Cloudinary uploads to two files per IP per 60 seconds, with graceful degradation when Redis is unavailable.
- An order-expiration worker runs every 60 seconds to release stock from expired unpaid orders.

## E-Commerce Web Application

A production-ready, high-performance full-stack e-commerce platform built with **Node.js, Express, Pug (SSR), MongoDB, and Redis**, fully containerized using **Docker**.

### Key Features

- **Server-Side Rendering:** Fast initial page loads and SEO-friendly views using Pug.
- **Distributed Caching:** Redis cache-aside integration reduces database load on high-traffic routes.
- **Automated Performance Testing:** k6 load-testing scripts cover core customer routes.
- **Security and Maintenance:** Helmet, validation, sanitization, secure cookies, and dependency auditing.

### Performance Testing

The project includes k6 scripts under the `k6/` directory:

| Script | Route |
| --- | --- |
| `k6/k6-smoke-get-login.js` | `GET /users/login` |
| `k6/k6-smoke-post-login.js` | `POST /users/login` |
| `k6/k6-smoke-search.js` | `GET /search?keyword=hoa` |
| `k6/k6-smoke-products.js` | `GET /products` |
| `k6/k6-smoke-product-pagination.js` | `GET /products?page=1/2` |
| `k6/k6-smoke-product-detail.js` | `GET /products/details/:slugProduct` |
| `k6/k6-smoke-carts.js` | `GET /carts` |

Start the application before running a test:

```powershell
docker compose up -d
```

Run a k6 test from the project root:

```powershell
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-get-login.js
```

Other route tests:

```powershell
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-post-login.js
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-search.js
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-products.js
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-product-pagination.js
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-carts.js
```

Product detail testing requires a valid product slug:

```powershell
$env:PRODUCT_SLUG="your-product-slug"
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-product-detail.js
```

POST login testing requires a test account:

```powershell
$env:TEST_EMAIL="test@example.com"
$env:TEST_PASSWORD="password123"
& "C:\Program Files\k6\k6.exe" run .\k6\k6-smoke-post-login.js
```

Confirm that the application is ready before starting a load test:

```powershell
Invoke-WebRequest http://127.0.0.1:3001/
```

### Verified Benchmark Results

| Route | Load | p95 latency | Error rate |
| --- | ---: | ---: | ---: |
| Homepage (`/`) | 10 VUs | 53.33 ms | 0.00% |
| Search (`/search`) | 10 VUs | 42.37 ms | 0.00% |

> Benchmark results depend on hardware, database location, cache state, network latency, and dataset size. Run the scripts in the current environment before publishing new measurements.

## Feature Highlights

### Customer storefront

- Homepage, product listing, categories, search, product details, blog, and contact page.
- Registration, login, JWT access/refresh token flow, logout, and password reset by email OTP.
- Profile updates and email-change verification flow.
- Guest cart, authenticated cart, and cart merge after login.
- Checkout by cash on delivery or VNPay.
- Order history, order details, cancellation, and delivery information updates.
- VNPay return handling and refund request flow for eligible cancellations.

Main customer URLs:

| URL | Purpose |
| --- | --- |
| `/` | Homepage |
| `/products` | Product listing and product details |
| `/search` | Product search |
| `/carts` | Cart |
| `/checkout` | Checkout and payment |
| `/users` | Registration, login, profile, and password recovery |
| `/orders` | Order history and order details |
| `/blogs` | Blog |
| `/contact` | Contact page |

### Admin dashboard

- Dashboard statistics and operational overview.
- Product CRUD, status changes, bulk actions, soft delete, recycle bin, restore, and permanent deletion.
- Product category CRUD with hierarchical category support.
- Account and user management with recycle-bin workflows.
- Role management and permission editing.
- Order listing, detail view, status transitions, bulk status changes, and deletion workflows.
- Blog post and post-category management.
- General website settings and administrator profile management.
- TinyMCE image upload through Cloudinary.

The admin dashboard is available at `/admin`. Sign in at `/admin/auth/login`; protected admin pages require the account to have the corresponding role permissions.

### Platform capabilities

- MongoDB persistence through Mongoose.
- Redis cache with cache invalidation helpers and graceful connection retry behavior.
- Cloudinary for product and editor media uploads.
- Cloudinary uploads are limited to 2 files per IP within a 60-second window.
- SMTP email delivery for OTP and account-related flows.
- Helmet security headers and Pug output escaping.
- Background worker for expiring unpaid orders and restoring reserved stock.
- Docker image and Docker Compose configuration for local development.

## Architecture

The application follows a conventional MVC-style structure:

```text
product-management/
├── index.js                 # Express bootstrap and graceful shutdown
├── config/                  # MongoDB, Redis, and application configuration
├── routes/                  # Client and admin route registration
├── controllers/             # Request handling and business orchestration
├── models/                  # Mongoose schemas and persistence models
├── middleware/              # Authentication, cart, upload, and shared request middleware
├── validates/               # Request validation rules
├── helpers/                 # Search, pagination, caching, pricing, upload, and utility logic
├── workers/                 # Background order-expiration worker
├── views/                   # Pug templates for client and admin experiences
├── public/                  # CSS, JavaScript, images, and static assets
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### Request flow

```text
Browser
  -> Express routes
  -> authentication / cart / upload middleware
  -> controller
  -> Mongoose model + Redis / Cloudinary / SMTP / VNPay
  -> Pug view or redirect
```

## Technology Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 20+ |
| Web framework | Express 5 |
| View layer | Pug, TinyMCE |
| Database | MongoDB, Mongoose 9 |
| Cache | Redis, ioredis |
| Authentication | JWT, bcrypt, HTTP-only cookies, refresh-token sessions |
| Validation | express-validator, sanitize-html |
| Media | Cloudinary, Multer |
| Email | Nodemailer, SMTP |
| Payments | VNPay sandbox integration |
| Security headers | Helmet |
| Local development | Nodemon, Docker Compose |

## Getting Started

### Prerequisites

- Node.js 20 or later and npm.
- MongoDB database, local or hosted.
- Redis instance. Redis is optional for local startup; when `REDIS_URL` is not set, the Redis helper defaults to `redis://localhost:6379` and cache/upload-counter features gracefully degrade when Redis is unavailable.
- Cloudinary account for image uploads. Required for upload-related features.
- SMTP credentials for email-based flows. Required for registration/password-recovery emails.
- VNPay sandbox credentials if payment testing is required. COD checkout does not require VNPay.

### Installation

```bash
git clone <repository-url>
cd product-management
npm install
```

Create a local `.env` file in this directory. Never commit real credentials. `PORT` defaults to `3000`, and `ACCESS_TOKEN_TTL` defaults to `15m` when omitted.

```env
PORT=3000
MONGO=mongodb+srv://<user>:<password>@<cluster>/<database>
REDIS_URL=redis://127.0.0.1:6379
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_TTL=15m

CLOUD_NAME=your-cloudinary-cloud
CLOUD_API_KEY=your-cloudinary-key
CLOUD_API_SECRET=your-cloudinary-secret

SMTP_SERVICE=gmail
SMTP_MAIL=your-email@example.com
SMTP_PASS=your-smtp-app-password

VNP_TMN_CODE=your-vnpay-terminal-code
VNP_HASH_SECRET=your-vnpay-hash-secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/checkout/vnpay_return
VNP_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

`MONGO` and `ACCESS_TOKEN_SECRET` should always be set. The Cloudinary, SMTP, and VNPay variables are only needed for the related features. `VNP_RETURN_URL` must be reachable by the browser after payment; for local testing, use the local checkout callback shown above.

Start the development server:

```bash
npm start
```

Open `http://localhost:3000`. The application connects to MongoDB lazily when a request arrives. Redis is initialized only when `REDIS_URL` is present; the helper itself still uses `localhost:6379` as its fallback when explicitly connected.

## Docker

The included image uses Node.js 20 Alpine and installs dependencies with `npm ci`.

```bash
docker compose up --build
```

Docker Compose loads environment variables from `.env`, mounts the source tree, and exposes port `3000`. MongoDB and Redis are external dependencies; provide `MONGO` and, when needed, `REDIS_URL` in `.env` before starting the container. The container runs `npm run start:docker`, which uses Nodemon polling for mounted files.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the development server with Nodemon and the Node inspector |
| `npm run start:docker` | Start Nodemon in polling mode for Docker-mounted source files |
| `npm test` | Not implemented yet; currently exits with a placeholder error |

The Node inspector is enabled by both start commands. When running locally, it is exposed on the default inspector port in addition to the HTTP port `3000`.

## Deployment Considerations

The project includes `vercel.json` and exports the Express app for Vercel, but the current entry point also starts a long-running background worker when run directly. The worker is not a reliable fit for serverless execution because serverless instances are short-lived. For production, deploy the application and worker on a long-running Node.js host such as a container platform or VM, or separate/refactor the worker before using a serverless runtime.

Before production, also configure:

- Separate production secrets and a managed MongoDB/Redis deployment.
- Secure cookie flags, an environment-based session secret, and CSRF protection for cookie-authenticated state-changing forms.
- Rate limiting and integration tests for authentication, checkout, payment callbacks, and order authorization.
- Monitoring for payment callbacks, worker failures, cache availability, and stock consistency.

## Contributing

1. Create a feature branch from `main`.
2. Keep changes scoped to the relevant route, controller, model, or helper.
3. Add or update tests as the test suite is expanded.
4. Verify the affected customer and admin workflows locally.
5. Open a pull request with the problem, solution, and verification steps.

## License

No license file is currently included in the repository. Add a license before distributing the project publicly.