import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { User, UserDocument } from '../users/entities/user.entity';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const FORGOT_PASSWORD_RESPONSE_MESSAGE =
  'If an account exists for that email, we sent password reset instructions.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private tokensService: TokensService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  getForgotPasswordResponseMessage(): string {
    return FORGOT_PASSWORD_RESPONSE_MESSAGE;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return;
    }

    const plainToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(plainToken).digest('hex');
    const ttlMs = this.configService.get<number>('passwordResetTokenTtlMs');
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = new Date(Date.now() + ttlMs);
    await user.save();

    const baseUrl = this.configService.get<string>('frontendUrl').replace(/\/$/, '');
    const pathSegment = this.configService.get<string>('passwordResetPath').replace(/^\/+/, '');
    const resetLink = `${baseUrl}/${pathSegment}?token=${encodeURIComponent(plainToken)}`;

    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetLink);
    } catch (error) {
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new InternalServerErrorException(
        'Unable to send reset email. Please try again later.',
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      })
      .select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await this.tokensService.revokeAllUserTokens(user._id.toString());
  }

  async signup(
    signupDto: SignupDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: AuthResponseDto; refreshToken: string }> {
    const { email, username, mobileNumber } = signupDto;

    // Check for existing user
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }, { mobileNumber }],
    });

    if (existingUser) {
      const duplicateChecks = [
        {
          field: 'email',
          value: email,
          message: 'User with this email already exists',
        },
        {
          field: 'username',
          value: username,
          message: 'Username is already taken',
        },
        {
          field: 'mobileNumber',
          value: mobileNumber,
          message: 'Mobile number is already registered',
        },
      ];

      for (const check of duplicateChecks) {
        if (existingUser[check.field] === check.value) {
          throw new ConflictException(check.message);
        }
      }
    }

    // Create user
    const newUser = new this.userModel(signupDto);
    await newUser.save();

    // Generate tokens
    const accessToken = this.tokensService.generateAccessToken(newUser);
    const refreshToken = this.tokensService.generateRefreshToken(newUser);

    // Store refresh token
    await this.tokensService.storeRefreshToken(
      refreshToken,
      newUser._id.toString(),
      userAgent,
      ipAddress,
    );

    try {
      await this.mailService.sendWelcomeEmail(newUser.email, newUser.firstName);
    } catch (error) {
      this.logger.warn(
        `Welcome email failed for ${newUser.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      user: {
        accessToken,
      },
      refreshToken,
    };
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ user: AuthResponseDto; refreshToken: string }> {
    const { email, username, mobileNumber, password } = loginDto;

    // Find user
    let user: UserDocument;
    if (email) {
      user = await this.userModel.findOne({ email: email.toLowerCase() });
    } else if (username) {
      user = await this.userModel.findOne({ username: username.toLowerCase() });
    } else if (mobileNumber) {
      user = await this.userModel.findOne({ mobileNumber });
    }

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.tokensService.generateAccessToken(user);
    const refreshToken = this.tokensService.generateRefreshToken(user);

    // Store refresh token
    await this.tokensService.storeRefreshToken(
      refreshToken,
      user._id.toString(),
      userAgent,
      ipAddress,
    );

    return {
      user: {
        accessToken,
      },
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const decoded = await this.tokensService.verifyRefreshToken(refreshToken);

    const user = await this.userModel.findById(decoded.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.tokensService.generateAccessToken(user);
  }

  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await this.tokensService.revokeRefreshToken(refreshToken);
    }
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.tokensService.revokeAllUserTokens(userId);
  }
}
