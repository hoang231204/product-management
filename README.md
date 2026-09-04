# Product Management

> A full-stack server-rendered ecommerce platform for managing products, orders, customers, content, and operations from a permission-based admin dashboard.

Product Management is built with **Node.js**, **Express 5**, **MongoDB**, **Redis**, and **Pug**. The project models a practical commerce workflow end to end: a customer can discover products, manage a cart, place a COD or VNPay order, and track it; an administrator can manage the catalog, users, roles, content, settings, inventory, and order lifecycle.

## Why This Project Stands Out

- **Complete business workflow:** product discovery, categories, cart, checkout, payment callback, order cancellation, and stock restoration.
- **Two operational surfaces:** a customer storefront and a protected admin dashboard rendered with Pug.
- **Granular RBAC:** roles are associated with explicit permissions such as `product_view`, `product_edit`, and `order_delete`.
- **JWT authentication:** short-lived access tokens, HTTP-only cookies, refresh-token persistence, and refresh-token rotation for client and admin accounts.
- **Security-focused input handling:** request validation, HTML sanitization, escaped Pug output, and controlled Mongoose query inputs.
- **Production-minded integrations:** Redis cache-aside patterns, Cloudinary media storage, SMTP email, VNPay payment, and graceful shutdown.
- **Concurrency awareness:** checkout uses MongoDB sessions, transactions, conditional stock updates, and rollback handling to reduce overselling risk.
- **Checkout idempotency:** repeated COD requests within the configured two-minute window reuse the existing order; repeated unpaid VNPay requests reuse the existing payment order.
- **Maintainable structure:** routes, controllers, models, middleware, validations, and helpers are separated by responsibility.

## Feature Highlights

### Customer storefront

- Homepage, product listing, categories, search, product details, blog, and contact page.
- Registration, login, JWT access/refresh token flow, logout, and password reset by email OTP.
- Profile updates and email-change verification flow.
- Guest cart, authenticated cart, and cart merge after login.
- Checkout by cash on delivery or VNPay.
- Order history, order details, cancellation, and delivery information updates.
- VNPay return handling and refund request flow for eligible cancellations.

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
- Redis instance. The application reads `REDIS_URL`.
- Cloudinary account for image uploads.
- SMTP credentials for email-based flows.
- VNPay sandbox credentials if payment testing is required.

### Installation

```bash
git clone <repository-url>
cd product-management
npm install
```

Create a local `.env` file. Never commit real credentials.

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

Start the development server:

```bash
npm start
```

Open `http://localhost:3000`. The admin routes are mounted under `/admin`.

## Docker

The included image uses Node.js 20 Alpine and installs dependencies with `npm ci`.

```bash
docker compose up --build
```

Docker Compose loads environment variables from `.env` and exposes port `3000`. MongoDB and Redis are external dependencies; provide their connection details in `.env` before starting the container.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the development server with Nodemon and the Node inspector |
| `npm run start:docker` | Start Nodemon in polling mode for Docker-mounted source files |
| `npm test` | Not implemented yet; currently exits with a placeholder error |

## Security and Reliability Notes

- **JWT authentication:** client and admin login handlers issue short-lived JWT access tokens. Protected middleware verifies the token, loads the current user/account, and rejects expired or invalid sessions.
- **Refresh-token rotation:** refresh tokens are stored in the session collection, rotated when a new access token is issued, and cleared on logout.
- **RBAC authorization:** admin middleware loads the account role, while protected controllers enforce granular permissions for products, orders, accounts, users, roles, posts, categories, and settings.
- **Password security:** passwords are hashed with bcrypt and are never selected into authenticated user/account context queries.
- **XSS mitigation:** Pug escapes interpolated values by default; request validators sanitize plain-text fields and allow only explicitly configured tags/attributes for rich text.
- **NoSQL injection mitigation:** request data is validated with `express-validator`, normalized before persistence, and query inputs are passed through application-controlled Mongoose query shapes rather than concatenated query strings.
- **HTTP security headers:** Helmet is enabled with a configured Content Security Policy and cross-origin policies.
- **CSRF mitigation for refresh tokens:** refresh tokens are stored in cookies with `httpOnly`, `secure`, and `sameSite: 'strict'`. `sameSite: 'strict'` prevents browsers from sending the refresh-token cookie in cross-site requests, while `httpOnly` prevents client-side JavaScript from reading it and `secure` restricts transmission to HTTPS. The project uses cookie attributes to protect the refresh-token flow rather than synchronizer tokens or a `csurf` middleware; state-changing routes should still receive an application-wide CSRF policy before production.
- Product reads use Redis cache helpers with explicit invalidation after relevant mutations.
- Checkout uses MongoDB transactions and stock conditions where the database deployment supports transactions.
- Checkout checks for an existing recent order before creating a new one, then atomically updates stock, creates the order, and clears the cart inside the transaction.
- Conditional `bulkWrite` stock updates ensure the database only decrements inventory when the requested quantity is still available; failed writes abort the transaction and preserve the cart.
- The order-expiration worker periodically handles unpaid orders and restores reserved inventory.
- Cloudinary upload counting uses an atomic Redis counter across application instances, with a local fallback when Redis is temporarily unavailable.
- Redis is currently used for cache-aside reads, invalidation, and the Cloudinary upload counter; it is not used for generic idempotency keys, distributed locks, sessions, or application-wide rate limiting.
- Idempotency is currently scoped to the checkout flow and recent cart/order state; it is not a generic `Idempotency-Key` middleware for every write endpoint.

## Deployment Considerations

The project includes `vercel.json`, but the current entry point starts a long-running Express server and a background worker. For production, deploy it to a long-running Node.js host such as a container platform or VM, or refactor the server entry point and worker before using a serverless runtime.

For production readiness, also configure:

- Separate production secrets and a managed MongoDB/Redis deployment.
- Secure cookie flags and an environment-based session secret.
- CSRF protection for cookie-authenticated state-changing forms.
- Rate limiting and automated integration tests for authentication, checkout, payment callbacks, and order authorization.
- Monitoring for payment callbacks, worker failures, cache availability, and stock consistency.

## Engineering Notes

This project is intentionally structured as a portfolio-quality business application rather than a collection of isolated CRUD examples. It demonstrates how a backend coordinates authentication, authorization, persistence, caching, file storage, email, payment, background processing, and server-rendered UX in one coherent system.

## Contributing

1. Create a feature branch from `main`.
2. Keep changes scoped to the relevant route, controller, model, or helper.
3. Add or update tests as the test suite is expanded.
4. Verify the affected customer and admin workflows locally.
5. Open a pull request with the problem, solution, and verification steps.

## License

No license file is currently included in the repository. Add a license before distributing the project publicly.
