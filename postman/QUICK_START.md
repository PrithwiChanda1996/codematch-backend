# 🚀 Quick Start Guide

## Import to Postman (30 seconds)

### Step 1: Import Files
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select both:
   - `DevTinder-NestJS-API.postman_collection.json`
   - `DevTinder-NestJS.postman_environment.json`

### Step 2: Select Environment
- Top-right dropdown → Select **"DevTinder NestJS - Local"**

### Step 3: Start Server
```bash
npm run start:dev
```

## 🎯 Test in 5 Minutes

### Quick Test Flow

1. **📋 Health Check**
   - Folder: Health
   - Verify server is running

2. **🔐 Signup**
   - Folder: Auth → "Signup - Success"
   - Click **Send**
   - ✅ User created, token saved automatically

3. **👤 Get User**
   - Folder: Users → "Get User by ID - Success"
   - Click **Send**
   - ✅ View your user profile

4. **✏️ Update Profile**
   - Folder: Users → "Update Profile - Success"
   - Click **Send**
   - ✅ Profile updated with demo data

5. **🔄 Refresh Token**
   - Folder: Auth → "Refresh Token - Success"
   - Click **Send**
   - ✅ New access token received

6. **🚪 Logout**
   - Folder: Auth → "Logout - Success"
   - Click **Send**
   - ✅ Logged out successfully

## 🧪 Run All Tests

Click collection → **Run** → **Run DevTinder NestJS API**

View results: 24 requests with automated assertions

## 📝 Key Points

- ✅ **Auto-authentication**: Tokens saved automatically
- ✅ **Auto-cookies**: Refresh tokens handled automatically
- ✅ **Auto-tests**: Every request has validation tests
- ✅ **24 scenarios**: Positive + negative test cases

## 🔗 Quick Links

- **Collection**: DevTinder NestJS API
- **Environment**: DevTinder NestJS - Local
- **Base URL**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs

## 💡 Pro Tips

1. **Run folder**: Right-click folder → "Run folder"
2. **View tests**: Check "Test Results" tab after sending
3. **Copy cURL**: Request → Code → cURL
4. **Save responses**: Right-click → "Save as example"

Need more details? See [README.md](./README.md)

