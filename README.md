# DevTinder Backend - NestJS TypeScript Version

Complete migration of DevTinder backend from Express.js to NestJS with TypeScript.

## 🎯 Features

- ✅ **TypeScript** - Full type safety
- ✅ **NestJS** - Modern, scalable Node.js framework
- ✅ **Hybrid Refresh Token Pattern** - Secure authentication
- ✅ **MongoDB** - NoSQL database with Mongoose
- ✅ **JWT Authentication** - Access & Refresh tokens
- ✅ **Validation** - Class-validator for DTOs
- ✅ **Modular Architecture** - Feature-based modules
- ✅ **Guards & Strategies** - Passport JWT
- ✅ **Cookie-based Refresh Tokens** - HttpOnly cookies

## 📁 Project Structure

```
src/
├── auth/                      # Authentication module
│   ├── auth.controller.ts     # Signup, login, logout endpoints
│   ├── auth.service.ts        # Auth business logic
│   ├── auth.module.ts         # Auth module configuration
│   ├── dto/                   # Data Transfer Objects
│   │   ├── signup.dto.ts
│   │   ├── login.dto.ts
│   │   └── auth-response.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts  # JWT authentication guard
│   ├── strategies/
│   │   └── jwt.strategy.ts    # Passport JWT strategy
│   └── decorators/
│       └── current-user.decorator.ts
│
├── users/                     # Users module
│   ├── users.controller.ts    # Get user, update profile
│   ├── users.service.ts       # User business logic
│   ├── users.module.ts        # User module configuration
│   ├── dto/
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts     # User schema
│   └── guards/
│       └── owner.guard.ts     # Profile ownership guard
│
├── tokens/                    # Token management module
│   ├── tokens.service.ts      # Token generation & validation
│   ├── tokens.module.ts       # Token module configuration
│   └── entities/
│       └── refresh-token.entity.ts
│
├── common/
│   └── constants/
│       └── skills.constant.ts # Valid skills list
│
├── config/
│   └── configuration.ts       # App configuration
│
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

### 3. Run the Application

```bash
# Development mode with watch
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Auth Module (Public)

#### 1. Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "password": "SecurePass@123",
  "age": 28,
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "username": "johndoe",
    "accessToken": "eyJhbGc..."
  }
}
```
**Sets Cookie:** `refreshToken` (HttpOnly, 7 days)

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

// Login with email
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}

// OR login with username
{
  "username": "johndoe",
  "password": "SecurePass@123"
}

// OR login with mobile
{
  "mobileNumber": "9876543210",
  "password": "SecurePass@123"
}
```

#### 3. Refresh Access Token
```http
POST /api/auth/refresh-token
Cookie: refreshToken=...
```

**Response:**
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### 4. Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

#### 5. Logout All Devices (Protected)
```http
POST /api/auth/logout-all
Authorization: Bearer <accessToken>
```

### Users Module (Protected)

All user endpoints require authentication via Bearer token.

#### 1. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <accessToken>
```

#### 2. Get User by Email
```http
GET /api/users/email/:email
Authorization: Bearer <accessToken>
```

#### 3. Get User by Mobile
```http
GET /api/users/mobile/:mobileNumber
Authorization: Bearer <accessToken>
```

#### 4. Update Profile (Own profile only)
```http
PATCH /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bio": "Full-stack developer...",
  "skills": ["JavaScript", "TypeScript", "NestJS"],
  "currentPosition": "Senior Developer",
  "location": "San Francisco"
}
```

## 🔐 Authentication Flow

```
1. User signs up/logs in
   ↓
2. Server generates:
   - Access Token (15 min) → Response body
   - Refresh Token (7 days) → HttpOnly cookie
   ↓
3. Client stores access token in memory
   ↓
4. Client makes API requests with Bearer token
   ↓
5. Access token expires → Client gets 401
   ↓
6. Client calls /refresh-token endpoint
   ↓
7. Server validates refresh token (cookie)
   ↓
8. Server returns new access token
   ↓
9. Client continues with new token
```

## 🛡️ Security Features

1. **HttpOnly Cookies** - Refresh tokens can't be accessed by JavaScript
2. **CSRF Protection** - `sameSite: strict` cookie setting
3. **Short-lived Access Tokens** - 15 minutes expiry
4. **Token Revocation** - Database-backed refresh tokens
5. **Password Hashing** - Bcrypt with 10 rounds
6. **Validation** - Class-validator on all DTOs
7. **Type Safety** - TypeScript prevents type errors

## 🔄 Migration from Express.js

### Key Differences

| Feature | Express.js | NestJS |
|---------|-----------|--------|
| **Structure** | Manual | Module-based |
| **Validation** | Joi middleware | Class-validator decorators |
| **DI** | Manual imports | Built-in injection |
| **Type Safety** | Runtime checks | Compile-time checks |
| **Testing** | Manual setup | Built-in utilities |
| **Documentation** | Manual | Auto-generated |

### Route Mapping

| Old Express Route | New NestJS Route |
|------------------|------------------|
| `POST /api/users/signup` | `POST /api/auth/signup` |
| `POST /api/users/login` | `POST /api/auth/login` |
| `POST /api/users/refresh-token` | `POST /api/auth/refresh-token` |
| `POST /api/users/logout` | `POST /api/auth/logout` |
| `POST /api/users/logout-all` | `POST /api/auth/logout-all` |
| `GET /api/users/:id` | `GET /api/users/:id` |
| `GET /api/users/email/:email` | `GET /api/users/email/:email` |
| `GET /api/users/mobile/:mobileNumber` | `GET /api/users/mobile/:mobileNumber` |
| `PATCH /api/users/profile` | `PATCH /api/users/profile` |

**Note:** Auth endpoints moved from `/api/users/*` to `/api/auth/*`

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test with Postman

Import the existing Postman collection and update the base URL:
- Change `http://localhost:3000/api/users` → `http://localhost:3000/api/auth` (for auth endpoints)
- Keep `http://localhost:3000/api/users` (for user endpoints)

## 📦 NPM Scripts

```bash
npm run build          # Build for production
npm run start          # Start production server
npm run start:dev      # Start dev server with watch
npm run start:debug    # Start with debugger
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run e2e tests
```

## 🔧 Configuration

### Default Configuration

Located in `src/config/configuration.ts`:

```typescript
{
  port: 3000,
  database: {
    uri: 'mongodb://...'
  },
  jwt: {
    accessSecret: 'devTinder_access_secret_2024',
    refreshSecret: 'devTinder_refresh_secret_2024',
    accessExpiry: '15m',
    refreshExpiry: '7d'
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}
```

### Environment Variables

Override defaults with `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=production
```

## 📚 Learn More

### NestJS Resources
- [Official Documentation](https://docs.nestjs.com/)
- [NestJS Fundamentals](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS Techniques](https://docs.nestjs.com/techniques/database)

### TypeScript Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## 🐛 Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Port already in use**
```bash
# Change port in .env or src/main.ts
PORT=3001 npm run start:dev
```

**3. MongoDB connection failed**
```bash
# Check connection string in configuration.ts
# Ensure MongoDB is running
# Check network access in MongoDB Atlas
```

**4. Cookie not being set**
```bash
# Check cookie settings in configuration.ts
# For localhost, secure: false
# For production with HTTPS, secure: true
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start:prod
```

### Environment Setup
- Set `NODE_ENV=production`
- Update MongoDB URI
- Use strong JWT secrets
- Enable HTTPS for cookies

## 💡 Why NestJS over Express?

### ✅ Advantages

1. **Type Safety** - Catch errors at compile time
2. **Architecture** - Built-in modular structure
3. **DI Container** - Easy dependency management
4. **Testing** - Built-in testing utilities
5. **Scalability** - Microservices ready
6. **Documentation** - Auto-generated with Swagger
7. **Maintainability** - Clear project structure
8. **Community** - Growing enterprise adoption

### ⚠️ Considerations

1. **Learning Curve** - Steeper than Express
2. **Boilerplate** - More code initially
3. **Performance** - Slightly more overhead

## 📝 License

ISC

## 👤 Author

Prithwi Chanda

---

## 🎉 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run the server: `npm run start:dev`
3. ✅ Test with Postman
4. ✅ Compare with Express version
5. ✅ Gradually migrate data/users if needed

**Enjoy building with NestJS! 🚀**

