# Auth Service

Simple JWT-based authentication microservice for Agro Vision.

## Setup

### Prerequisites
- Node.js 14+
- MongoDB (local or Atlas)

### Installation

```bash
cd auth-service
npm install
```

### Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your MongoDB connection string and JWT secret:

```env
MONGODB_URI=mongodb://localhost:27017/agri_app_users
JWT_SECRET=your-super-secret-key-here
PORT=4000
```

### Running

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:4000`

## API Endpoints

### 1. Register User
**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login User
**POST** `/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Verify Token (Internal)
**POST** `/auth/verify`

Request:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "success": true,
  "message": "Token is valid",
  "userId": "507f1f77bcf86cd799439011"
}
```

## Features

- ✅ User registration with email validation
- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ Email uniqueness check
- ✅ Secure password comparison
- ✅ CORS enabled
- ✅ Security headers with Helmet
- ✅ Error handling

## Database Schema

**Users Collection:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

## Security

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days (configurable)
- CORS configured for microservice communication
- Security headers added with Helmet
- Email validation built-in
