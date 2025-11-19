# Migration Guide: Express.js to NestJS

## ✅ Migration Complete!

Your DevTinder backend has been successfully migrated from Express.js to NestJS with TypeScript.

## 📊 What Changed

### 1. **Project Structure**

**Before (Express.js):**
```
src/
├── config/
├── constants/
├── controller/
├── middlewares/
├── models/
├── routes/
└── services/
```

**After (NestJS):**
```
src/
├── auth/              # Authentication feature module
├── users/             # Users feature module
├── tokens/            # Token management module
├── common/            # Shared resources
└── config/            # Configuration
```

### 2. **API Endpoint Changes**

#### Auth Endpoints (Moved from /api/users to /api/auth)
| Old Express Route | New NestJS Route | Status |
|-------------------|-----------------|--------|
| `POST /api/users/signup` | `POST /api/auth/signup` | ✅ |
| `POST /api/users/login` | `POST /api/auth/login` | ✅ |
| `POST /api/users/refresh-token` | `POST /api/auth/refresh-token` | ✅ |
| `POST /api/users/logout` | `POST /api/auth/logout` | ✅ |
| `POST /api/users/logout-all` | `POST /api/auth/logout-all` | ✅ |

#### User Endpoints (Unchanged)
| Express Route | NestJS Route | Status |
|---------------|--------------|--------|
| `GET /api/users/:id` | `GET /api/users/:id` | ✅ |
| `GET /api/users/email/:email` | `GET /api/users/email/:email` | ✅ |
| `GET /api/users/mobile/:mobileNumber` | `GET /api/users/mobile/:mobileNumber` | ✅ |
| `PATCH /api/users/profile` | `PATCH /api/users/profile` | ✅ |

### 3. **Code Comparison**

#### User Model

**Express.js (JavaScript):**
```javascript
// src/models/user.model.js
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  // ... more fields
});

userSchema.pre("save", async function (next) {
  // Hash password
});
```

**NestJS (TypeScript):**
```typescript
// src/users/entities/user.entity.ts
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;
  
  // ... more fields
}

UserSchema.pre('save', async function(next) {
  // Hash password
});
```

#### Controller

**Express.js (JavaScript):**
```javascript
// src/controller/user.controller.js
const signup = async (req, res, next) => {
  try {
    const result = await userService.registerUser(req.body, req);
    res.cookie("refreshToken", result.refreshToken, cookieConfig);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
```

**NestJS (TypeScript):**
```typescript
// src/auth/auth.controller.ts
@Post('signup')
@HttpCode(HttpStatus.CREATED)
async signup(
  @Body() signupDto: SignupDto,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.signup(signupDto, req.headers['user-agent'], req.ip);
  res.cookie('refreshToken', result.refreshToken, this.configService.get('cookie'));
  
  return {
    success: true,
    message: 'User registered successfully',
    data: result.user,
  };
}
```

#### Validation

**Express.js (Joi Middleware):**
```javascript
// src/middlewares/validation.middleware.js
const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  // ... more fields
});

const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    // Handle error
  }
  next();
};
```

**NestJS (Class-validator DTOs):**
```typescript
// src/auth/dto/signup.dto.ts
export class SignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
  
  // ... more fields
}

// Validation happens automatically!
```

#### Authentication Middleware

**Express.js (Middleware):**
```javascript
// src/middlewares/auth.middleware.js
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
```

**NestJS (Guard + Strategy):**
```typescript
// src/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.accessSecret'),
    });
  }

  async validate(payload: any) {
    return { id: payload.id, username: payload.username, email: payload.email };
  }
}

// Usage in controller:
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}
```

### 4. **Dependency Injection**

**Express.js (Manual Imports):**
```javascript
// Manual imports everywhere
const userService = require("../services/user.service");
const tokenService = require("../services/token.service");
const { jwtConfig } = require("../config/config");
```

**NestJS (Automatic Injection):**
```typescript
@Injectable()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  // Dependencies automatically injected
}
```

## 🚀 Testing the Migration

### Step 1: Install Dependencies
```bash
cd nestjs-version
npm install
```

### Step 2: Start Server
```bash
npm run start:dev
```

### Step 3: Test Endpoints

#### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "password": "SecurePass@123",
    "age": 28,
    "gender": "male"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

**Get User (with token):**
```bash
curl -X GET http://localhost:3000/api/users/{userId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: Update Postman Collection

1. Open your existing Postman collection
2. Update base URLs for auth endpoints:
   - Change `{{baseUrl}}/api/users/signup` → `{{baseUrl}}/api/auth/signup`
   - Change `{{baseUrl}}/api/users/login` → `{{baseUrl}}/api/auth/login`
   - Change `{{baseUrl}}/api/users/refresh-token` → `{{baseUrl}}/api/auth/refresh-token`
   - Change `{{baseUrl}}/api/users/logout` → `{{baseUrl}}/api/auth/logout`
   - Change `{{baseUrl}}/api/users/logout-all` → `{{baseUrl}}/api/auth/logout-all`
3. Keep user endpoints as they are

## 📋 Migration Checklist

- [x] Project structure setup
- [x] Configuration files
- [x] User entity (schema)
- [x] RefreshToken entity (schema)
- [x] DTOs for validation
- [x] Token service
- [x] Auth service
- [x] Auth controller
- [x] Users service
- [x] Users controller
- [x] JWT strategy
- [x] JWT guard
- [x] Owner guard
- [x] Current user decorator
- [x] Modules configuration
- [x] Main application setup
- [x] Cookie parser integration
- [x] Global validation pipe
- [x] Documentation

## 🔄 Data Migration (Optional)

If you want to use the same database:

**No migration needed!** The NestJS version uses the exact same:
- MongoDB database
- Collection names (`users`, `refreshtokens`)
- Schema structure
- Password hashing

Just point to the same MongoDB connection string in `configuration.ts`.

## ⚖️ Running Both Versions

You can run both versions simultaneously on different ports:

**Express.js (Current):**
```bash
# In root directory
npm start  # Runs on port 3000
```

**NestJS:**
```bash
# In nestjs-version directory
PORT=3001 npm run start:dev  # Runs on port 3001
```

## 🎓 Learning Resources

### NestJS Concepts Used

1. **Modules** - Organize code into feature modules
2. **Controllers** - Handle HTTP requests
3. **Services** - Business logic (Injectable)
4. **Guards** - Authentication & authorization
5. **Strategies** - Passport authentication strategies
6. **DTOs** - Data validation with class-validator
7. **Decorators** - @Get, @Post, @UseGuards, @Body, etc.
8. **Dependency Injection** - Constructor injection
9. **Pipes** - ValidationPipe for automatic validation
10. **Interceptors** - Request/response transformation

### TypeScript Features Used

1. **Types & Interfaces** - Strong typing
2. **Decorators** - Metadata for classes/properties
3. **Generics** - Type-safe code reuse
4. **Enums** - Named constants
5. **Optional Properties** - `?` operator
6. **Type Guards** - Runtime type checking
7. **Async/Await** - Promise handling
8. **Import/Export** - ES6 modules

## 🔧 Troubleshooting

### Issue: Cannot find module

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Validation not working

**Solution:**
Make sure ValidationPipe is configured in `main.ts`:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
);
```

### Issue: Cookies not being set

**Solution:**
1. Check cookie configuration in `configuration.ts`
2. For localhost, set `secure: false`
3. Make sure cookie-parser is imported in `main.ts`

### Issue: Database connection failed

**Solution:**
1. Check MongoDB connection string in `configuration.ts`
2. Ensure IP is whitelisted in MongoDB Atlas
3. Verify username/password are correct

## 📊 Performance Comparison

### Express.js
- ✅ Lightweight
- ✅ Fast startup
- ✅ Minimal overhead
- ❌ Manual architecture
- ❌ No built-in DI

### NestJS
- ✅ Structured architecture
- ✅ Built-in DI
- ✅ Better for large projects
- ✅ Enterprise-ready
- ⚠️ Slightly more overhead
- ⚠️ Slower startup (dev mode)

## 🎯 Next Steps

1. ✅ Review the code structure
2. ✅ Test all endpoints
3. ✅ Compare with Express version
4. ✅ Add unit tests
5. ✅ Add e2e tests
6. ✅ Set up CI/CD
7. ✅ Deploy to production

## 💡 Best Practices Applied

- ✅ Modular architecture (feature-based)
- ✅ Separation of concerns (Service/Controller/Module)
- ✅ Dependency injection
- ✅ Type safety (TypeScript)
- ✅ Validation (class-validator)
- ✅ Security (Guards, JWT)
- ✅ Error handling (Exception filters)
- ✅ Configuration management (@nestjs/config)
- ✅ Clean code principles

## 🎉 Congratulations!

You now have a fully functional NestJS backend with:
- ✅ TypeScript type safety
- ✅ Modern architecture
- ✅ Enterprise-grade patterns
- ✅ Same API functionality
- ✅ Better scalability
- ✅ Easier maintenance

**Happy coding with NestJS! 🚀**

