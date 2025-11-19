# DevTinder NestJS - Postman Collection Guide

## 📚 Overview

This Postman collection provides comprehensive testing for all DevTinder NestJS API endpoints with automated tests, environment variables, and cookie handling.

## 📦 What's Included

### Files
1. **DevTinder-NestJS-API.postman_collection.json** - Complete API collection
2. **DevTinder-NestJS.postman_environment.json** - Environment variables
3. **README.md** - This guide

### API Endpoints Covered

#### 🔐 Authentication (13 requests)
- ✅ Signup - Success
- ❌ Signup - Duplicate Email
- ❌ Signup - Invalid Data
- ✅ Login - Email
- ✅ Login - Username
- ✅ Login - Mobile Number
- ❌ Login - Invalid Credentials
- ❌ Login - User Not Found
- ✅ Refresh Token - Success
- ❌ Refresh Token - No Cookie
- ✅ Logout - Success
- ❌ Logout - Unauthorized
- ✅ Logout All Devices - Success

#### 👤 Users (10 requests)
- ✅ Get User by ID - Success
- ❌ Get User by ID - Unauthorized
- ❌ Get User by ID - Not Found
- ✅ Get User by Email - Success
- ✅ Get User by Mobile - Success
- ✅ Update Profile - Success
- ❌ Update Profile - Invalid Skills
- ❌ Update Profile - Bio Too Short
- ❌ Update Profile - Invalid URL
- ❌ Update Profile - Unauthorized

#### 💚 Health (1 request)
- ✅ Health Check

**Total: 24 requests** covering positive and negative test scenarios

## 🚀 Getting Started

### Step 1: Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `DevTinder-NestJS-API.postman_collection.json`
   - `DevTinder-NestJS.postman_environment.json`
4. Click **Import**

### Step 2: Select Environment

1. In the top-right corner, click the environment dropdown
2. Select **"DevTinder NestJS - Local"**

### Step 3: Start Your Server

```bash
cd "C:\Users\Prithwi Chanda\Desktop\devTinder-backend"
npm run start:dev
```

Wait for the server to start (you should see the startup messages).

### Step 4: Run Tests

You can run tests in different ways:

#### Option A: Run Entire Collection
1. Click on the collection name
2. Click **Run** button
3. Click **Run DevTinder NestJS API**
4. View test results

#### Option B: Run Individual Folders
- Right-click on "Auth", "Users", or "Health" folder
- Click **Run folder**

#### Option C: Run Individual Requests
- Click on any request
- Click **Send** button
- View response and test results in the bottom panel

## 🎯 Recommended Testing Flow

### Complete Flow Test

Run requests in this order for a complete end-to-end test:

1. **Health Check** - Verify server is running
2. **Signup - Success** - Create a new user
   - ✅ Access token automatically saved
   - ✅ Refresh token automatically saved in cookies
3. **Get User by ID - Success** - View user details
4. **Update Profile - Success** - Update user profile
5. **Refresh Token - Success** - Get new access token
6. **Logout - Success** - Logout from current device

### Error Handling Tests

Test negative scenarios:

1. **Signup - Duplicate Email** - Attempt duplicate registration
2. **Signup - Invalid Data** - Test validation
3. **Login - Invalid Credentials** - Wrong password
4. **Login - User Not Found** - Non-existent user
5. **Get User by ID - Unauthorized** - Without token
6. **Update Profile - Invalid Skills** - Bad data

## 🔧 Environment Variables

The collection uses these environment variables:

| Variable | Description | Auto-set |
|----------|-------------|----------|
| `baseUrl` | API base URL | Manual |
| `accessToken` | JWT access token | Auto |
| `userId` | Current user ID | Auto |
| `username` | Current username | Auto |

### Auto-set Variables

After successful **Signup** or **Login**, these are automatically saved:
- `accessToken` - Used for authenticated requests
- `userId` - Used in dynamic URLs
- `username` - For reference

### Changing Base URL

To test against different environments:

1. Click environment name dropdown
2. Click edit icon (pencil)
3. Change `baseUrl` value:
   - Local: `http://localhost:3000/api`
   - Production: `https://your-domain.com/api`
4. Click **Save**

## 🍪 Cookie Management

### Automatic Cookie Handling

Postman automatically handles cookies for:
- ✅ **Signup** - Sets `refreshToken` cookie
- ✅ **Login** - Sets `refreshToken` cookie
- ✅ **Refresh Token** - Reads `refreshToken` cookie
- ✅ **Logout** - Clears `refreshToken` cookie

### View Cookies

1. Click **Cookies** link below the Send button
2. Select your domain (localhost:3000)
3. View/manage cookies

### Clear Cookies

If you need to clear cookies:
1. Click **Cookies** link
2. Select cookies
3. Click **Remove**

## 🔐 Authentication Flow

### Manual Token Setup (if needed)

If auto-save doesn't work:

1. Send **Signup** or **Login** request
2. Copy `accessToken` from response
3. Click environment dropdown → Edit
4. Paste token into `accessToken` variable
5. Save

### Bearer Token

The collection uses **Bearer Token** authentication at the collection level:
- Token: `{{accessToken}}`
- Automatically applied to requests needing auth
- Some requests override this with "No Auth"

## ✅ Automated Tests

Each request includes automated tests that verify:

### Success Scenarios
- ✅ Correct status code
- ✅ Response structure
- ✅ Required fields present
- ✅ Data types correct
- ✅ Cookies set/cleared
- ✅ Sensitive data excluded

### Error Scenarios
- ❌ Correct error status code
- ❌ Error message present
- ❌ Validation errors shown

### View Test Results

After sending a request:
1. Scroll to **Test Results** tab
2. See passed/failed tests with details
3. Green ✓ = Passed, Red ✗ = Failed

## 📊 Collection Runner

For automated testing:

1. Click collection name
2. Click **Run** button
3. Configure:
   - **Iterations**: Number of times to run (default: 1)
   - **Delay**: Time between requests (ms)
   - **Save responses**: Keep response data
4. Click **Run DevTinder NestJS API**

### Runner Results

View:
- ✅ Total requests sent
- ✅ Tests passed/failed
- ✅ Response times
- ✅ Request/response details

## 🐛 Troubleshooting

### Issue: "Could not get response"

**Solution:**
- Verify server is running: `npm run start:dev`
- Check server URL in environment variables
- Ensure port 3000 is not blocked

### Issue: "401 Unauthorized"

**Solution:**
- Run **Login** request first
- Verify `accessToken` is set in environment
- Token might be expired - login again

### Issue: "Refresh token not found"

**Solution:**
- Cookies might be cleared
- Run **Login** to get new refresh token
- Check cookie settings in Postman

### Issue: Tests failing

**Solution:**
- Check response body structure
- Verify server is returning expected data
- Review test scripts if needed

### Issue: "409 Conflict" on Signup

**Solution:**
- User already exists
- Change email/username/mobile in request body
- Use unique values for testing

## 📝 Customizing Requests

### Modify Request Body

1. Click on request
2. Go to **Body** tab
3. Edit JSON data
4. Click **Send**

### Add New Requests

1. Right-click on folder
2. Click **Add Request**
3. Configure method, URL, headers, body
4. Add tests if needed
5. Save

### Edit Tests

1. Click on request
2. Go to **Tests** tab
3. Modify JavaScript test code
4. Save

## 🎨 Tips & Best Practices

### 1. Use Collection Runner for Regression Testing
Run entire collection before deployments

### 2. Create Multiple Environments
- Development
- Staging
- Production

### 3. Save Example Responses
Right-click response → **Save as example**

### 4. Use Pre-request Scripts
For dynamic data generation:
```javascript
pm.environment.set("timestamp", Date.now());
```

### 5. Export Test Results
Collection Runner → Export results (JSON/CSV)

### 6. Version Control
Commit collection files to git for team sharing

### 7. Monitor API Changes
Compare responses when updating API

## 📋 Quick Reference

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - Send request
- `Ctrl/Cmd + S` - Save request
- `Ctrl/Cmd + K` - Search

### Status Code Reference
- `200 OK` - Success
- `201 Created` - Resource created (signup)
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource

## 🔗 Related Resources

- **Swagger Documentation**: http://localhost:3000/api/docs
- **Health Endpoint**: http://localhost:3000/api/health
- **MongoDB Compass**: mongodb://localhost:27017/devTinder

## 📧 Support

For issues or questions:
1. Check server logs
2. Review Swagger documentation
3. Verify MongoDB connection
4. Check environment variables

## 🎉 Happy Testing!

This collection covers all major scenarios for the DevTinder API. Run tests regularly to ensure API stability and catch regressions early.

---

**Last Updated:** November 19, 2024  
**API Version:** 1.0.0  
**Collection Version:** 1.0.0

