# Quick Setup Instructions

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (2-3 minutes)
```bash
cd nestjs-version
npm install
```

### Step 2: Start the Server (Instant)
```bash
npm run start:dev
```

You should see:
```
🚀 Server is running on http://localhost:3000
📚 API endpoints available at http://localhost:3000/api
```

### Step 3: Test an Endpoint

Open another terminal or use Postman:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "email": "test@example.com",
    "mobileNumber": "9999999999",
    "password": "Test@123",
    "age": 25,
    "gender": "male"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "username": "testuser",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## ✅ That's it!

Your NestJS server is now running with all the same functionality as your Express.js version, plus TypeScript benefits!

## 📡 All Available Endpoints

### Auth Module (Public)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (email/username/mobile)
- `POST /api/auth/refresh-token` - Get new access token
- `POST /api/auth/logout` - Logout (protected)
- `POST /api/auth/logout-all` - Logout from all devices (protected)

### Users Module (Protected - Requires Bearer Token)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `GET /api/users/mobile/:mobileNumber` - Get user by mobile
- `PATCH /api/users/profile` - Update own profile

## 🔧 Development Commands

```bash
# Start in watch mode (auto-restart on changes)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## 📖 More Info

- See `README.md` for detailed documentation
- See `MIGRATION_GUIDE.md` for comparison with Express.js
- Check `src/` folder for code organization

## 🐛 Need Help?

Common issues and solutions are in `MIGRATION_GUIDE.md` under "Troubleshooting"

**Enjoy your new NestJS backend! 🎉**

