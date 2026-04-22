# Advanced API Gateway

High-performance API Gateway with Redis-based rate limiting, JWT verification, and response caching.

## Architecture

```
User Request
    ↓
[Rate Limit Check] ← Redis (20 req/min per IP)
    ↓
[JWT Verification] ← jsonwebtoken
    ↓
[Cache Check] ← Redis (for POST /api/recommend)
    ├─→ Cache HIT: Return immediately (<1ms)
    └─→ Cache MISS: Forward to Python service
    ↓
[Forward to Service] ← axios
    ↓
[Save to Cache] ← Redis (1 hour expiry)
    ↓
Response to User
```

## Setup

### Prerequisites
- Node.js 14+
- Redis (local or remote)
- Auth Service running on port 4000
- Crop Recommendation Service running on port 8001
- Disease Detection Service running on port 8002

### Installation

```bash
cd api-gateway
npm install
```

### Configuration

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Edit `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
CROP_RECOMMENDATION_URL=http://localhost:8001
DISEASE_DETECTION_URL=http://localhost:8002
PORT=5000
```

### Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## Middleware Stack

### 1. Rate Limiting (Redis)
- **Limit:** 20 requests per minute per IP
- **Response:** 429 Too Many Requests if exceeded
- **Storage:** Redis with prefix `rl:`
- **Bypass:** Health check endpoints

```json
{
  "success": false,
  "message": "Too many requests from this IP. Limit: 20 requests per minute.",
  "retryAfter": 1234567890
}
```

### 2. JWT Verification
- **Check:** Authorization header (Bearer token)
- **Return:** 401 Unauthorized if invalid/missing
- **Bypass:** Health endpoints (/, /health)
- **Payload:** Stored in `req.user`

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "jwt expired"
}
```

### 3. Response Caching (Redis)
- **Scope:** POST /api/recommend only
- **Key:** `cache:recommend:{md5_hash_of_input}`
- **Expiry:** 1 hour
- **Hit Rate:** Returns cached data with `cached: true`

```json
{
  "success": true,
  "message": "Response from cache (instant result)",
  "cached": true,
  "latency": "<1ms",
  "data": { /* cached response */ }
}
```

---

## API Endpoints

### 1. Crop Recommendation (with Cache)
**POST** `/api/recommend`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.87,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Response (Cache HIT):**
```json
{
  "success": true,
  "message": "Response from cache (instant result)",
  "cached": true,
  "latency": "<1ms",
  "data": {
    "recommended_crop": "Rice",
    "prediction_index": 1
  }
}
```

**Response (Cache MISS):**
```json
{
  "success": true,
  "message": "Crop recommendation retrieved from Python service",
  "cached": false,
  "latency": "250ms",
  "data": {
    "recommended_crop": "Rice",
    "prediction_index": 1
  }
}
```

### 2. Disease Detection
**POST** `/api/disease-detect`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Request:**
```
Form Data: file=<image_file>
```

**Response:**
```json
{
  "success": true,
  "message": "Disease detection completed",
  "latency": "1200ms",
  "data": {
    "predicted_crop": "Apple",
    "disease": "Apple Scab",
    "confidence": 0.95,
    "class_index": 0
  }
}
```

### 3. Service Health
**GET** `/api/health`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Gateway Health Check",
  "services": {
    "cropRecommendation": "UP",
    "diseaseDetection": "UP"
  },
  "timestamp": "2026-01-23T10:30:00.000Z"
}
```

### 4. Gateway Health (no auth required)
**GET** `/health`

**Response:**
```json
{
  "message": "Gateway Health Check",
  "status": "healthy",
  "redis": "connected",
  "timestamp": "2026-01-23T10:30:00.000Z"
}
```

---

## Request Flow Example

### Scenario: User sends crop recommendation request

```
1. USER REQUEST
   POST /api/recommend
   Header: Authorization: Bearer token123

2. GATEWAY - Rate Limit Check
   ✓ Redis: Check IP has <20 requests/min
   → PASS

3. GATEWAY - JWT Verification
   ✓ Decode token: token123
   → PASS (token valid, userId extracted)

4. GATEWAY - Cache Check
   MD5 hash of {N: 90, P: 42, K: 43, ...} = abc123
   ✗ Redis: GET cache:recommend:abc123
   → MISS (not in cache)

5. GATEWAY - Forward to Python Service
   POST http://localhost:8001/recommend
   → Wait for ML model response (250ms)

6. GATEWAY - Save to Cache (async)
   Redis: SETEX cache:recommend:abc123 3600 {response}

7. RESPONSE TO USER
   {
     "success": true,
     "cached": false,
     "latency": "250ms",
     "data": { "recommended_crop": "Rice" }
   }

---

### Scenario: Same user sends identical request 2 minutes later

```
1. USER REQUEST
   (same as above)

2. GATEWAY - Rate Limit Check
   ✓ PASS

3. GATEWAY - JWT Verification
   ✓ PASS

4. GATEWAY - Cache Check
   MD5 hash = abc123 (same as before)
   ✓ Redis: GET cache:recommend:abc123
   → HIT (data exists in cache)

5. IMMEDIATE RESPONSE TO USER
   {
     "success": true,
     "cached": true,
     "latency": "<1ms",
     "data": { "recommended_crop": "Rice" }
   }

   ⚡ SPEEDUP: 250ms → <1ms (250x faster!)
```

---

## Redis Key Structure

```
Rate Limiting:
  rl:192.168.1.1       → count of requests
  rl:10.0.0.5:POST:/api/recommend → count

Caching:
  cache:recommend:abc123def456   → cached response JSON
  cache:disease:xyz789           → cached disease detection
```

---

## Testing

Run the integration test suite:

```bash
node test.js
```

Tests:
- ✅ Get auth token
- ✅ Rate limiting (5 concurrent requests)
- ✅ JWT verification (valid, invalid, missing token)
- ✅ Response caching (cache miss vs cache hit)
- ✅ Service health checks

---

## Performance Metrics

### Without Caching
```
Request 1: 250ms  (Python service + network)
Request 2: 250ms  (Python service + network)
Request 3: 250ms  (Python service + network)
Total:     750ms
```

### With Caching
```
Request 1: 250ms  (cache miss, Python service)
Request 2: <1ms   (cache hit, Redis)
Request 3: <1ms   (cache hit, Redis)
Total:     251ms
⚡ 97% faster!
```

---

## Security Features

- ✅ JWT token verification on all protected routes
- ✅ Rate limiting prevents DDoS attacks
- ✅ CORS enabled for microservices
- ✅ Security headers with Helmet
- ✅ Error handling without exposing internals

---

## Troubleshooting

**Issue:** "Redis connection refused"
- Solution: Make sure Redis is running (`redis-server`)

**Issue:** "Invalid token"
- Solution: Use JWT_SECRET from Auth Service

**Issue:** "502 Bad Gateway"
- Solution: Check if Python services are running on 8001/8002

---

## Monitoring Redis

```bash
# Connect to Redis CLI
redis-cli

# Check rate limit keys
KEYS rl:*

# Check cache keys
KEYS cache:*

# View specific cache
GET cache:recommend:abc123

# Clear cache
FLUSHDB
```
