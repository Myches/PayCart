# PayCart — AWS E-commerce Platform

> Next.js frontend · Node/Express backend · PostgreSQL database
> Designed for AWS Free Tier: S3 + CloudFront · Lambda · API Gateway · RDS

---

## Project Structure

```
paycart/
├── frontend/          # Next.js 14 (TypeScript, Tailwind)
├── backend/           # Express API (TypeScript, serverless-http)
└── database/          # schema.sql + seed.sql
```

---

## Phase 1 — Local Development (Start Here)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally
- AWS CLI configured (`aws configure`)

### 1. Database

```bash
# Create local database
psql -U postgres -c "CREATE DATABASE paycart;"

# Run schema
psql -U postgres -d paycart -f database/schema.sql

# Seed sample data
psql -U postgres -d paycart -f database/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # Edit file and fill in your values
npm install
npm run dev                    # Runs on http://localhost:4000
```

Test: `curl http://localhost:4000/api/health`

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # Edit file and fill in your values
npm install
npm run dev                    # Runs on http://localhost:3000
```

---

## Phase 2 — AWS Deployment (Free Tier)

### Step 1 — RDS PostgreSQL

1. AWS Console → RDS → Create database
2. Engine: **PostgreSQL 15**, Template: **Free Tier**
3. DB instance: `db.t3.micro`, 20 GB gp2 storage
4. Enable **public access: No** (Lambda in same VPC)
5. Note the endpoint, run `schema.sql` against it

### Step 2 — Lambda (Backend)

```bash
cd backend
npm run build
zip -r function.zip dist/ node_modules/ package.json

# Create Lambda function
aws lambda create-function \
  --function-name paycart-api \
  --runtime nodejs20.x \
  --handler dist/index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/paycart-lambda-role \
  --environment Variables="{NODE_ENV=production,DB_HOST=YOUR_RDS_ENDPOINT,...}"
```

### Step 3 — API Gateway

1. AWS Console → API Gateway → Create HTTP API
2. Integration: Lambda → `paycart-api`
3. Routes: `ANY /{proxy+}` → Lambda
4. Stage: `prod`
5. Note the invoke URL → set as `NEXT_PUBLIC_API_URL` in frontend

### Step 4 — S3 + CloudFront (Frontend)

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://YOUR_API_GW.execute-api.us-east-1.amazonaws.com/prod/api 
npm run build

# Create S3 bucket (us-east-1!)
aws s3 mb s3://paycart-frontend-YOUR_ACCOUNT --region us-east-1

# Upload
aws s3 sync out/ s3://paycart-frontend-YOUR_ACCOUNT --delete

# Create CloudFront distribution pointing to the bucket
# Set default root object: index.html
# Set error page 404 → /index.html (for SPA routing)
```

### Step 5 — CloudWatch (Monitoring)

1. AWS Console → CloudWatch → Dashboards → Create
2. Add widgets:
   - Lambda: Invocations, Errors, Duration
   - API Gateway: 4xx/5xx errors, Latency
   - RDS: CPUUtilization, DatabaseConnections

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | API Gateway or localhost URL |
| `DB_HOST` | Backend Lambda | RDS endpoint |
| `DB_NAME` | Backend Lambda | `paycart` |
| `DB_USER` | Backend Lambda | RDS master username |
| `DB_PASSWORD` | Backend Lambda | RDS master password (use Secrets Manager in prod) |
| `JWT_SECRET` | Backend Lambda | 64-char random string |
| `FRONTEND_URL` | Backend Lambda | CloudFront domain (for CORS) |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/:id` | Admin | Update product |
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders` | Customer | My orders |
| GET | `/api/admin/dashboard` | Admin | Stats |
| GET | `/api/admin/orders` | Admin | All orders |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update status |

---

## Free Tier Resources Used

| Service | Free Tier Limit | Usage |
|---|---|---|
| Lambda | 1M requests/mo | API calls |
| API Gateway | 1M calls/mo | HTTP routing |
| RDS `db.t3.micro` | 750 hrs/mo | PostgreSQL |
| S3 | 5 GB storage | Frontend static files |
| CloudFront | 1 TB transfer/mo | CDN for frontend |
| CloudWatch | 10 metrics/mo | Monitoring |

Full Documentation Link : https://drive.google.com/file/d/14saASo1MQfju_X5x3SL36dnV9RHfPxto/view?usp=sharing
