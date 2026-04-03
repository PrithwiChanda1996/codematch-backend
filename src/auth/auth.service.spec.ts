import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'crypto';
import { AuthService } from './auth.service';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { createMockModel, mockUser, mockConfigService } from '../../test/helpers/mock-factories';
import {
  validSignupDto,
  validLoginDto,
  validLoginWithUsernameDto,
  validLoginWithMobileDto,
} from '../../test/helpers/test-fixtures';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let tokensService: jest.Mocked<TokensService>;
  let mailService: jest.Mocked<Pick<MailService, 'sendPasswordResetEmail' | 'sendWelcomeEmail'>>;

  beforeEach(async () => {
    const mockUserModel = createMockModel(mockUser());

    const mockTokensService = {
      generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
      storeRefreshToken: jest.fn().mockResolvedValue(undefined),
      verifyRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
      revokeAllUserTokens: jest.fn().mockResolvedValue(undefined),
    };

    const mockMailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: TokensService,
          useValue: mockTokensService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    tokensService = module.get(TokensService);
    mailService = module.get(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully create a new user', async () => {
      const newUser = mockUser({ ...validSignupDto });
      userModel.findOne.mockResolvedValue(null);
      userModel.mockImplementation(() => ({
        ...newUser,
        save: jest.fn().mockResolvedValue(newUser),
      }));

      const result = await service.signup(validSignupDto, 'Mozilla/5.0', '127.0.0.1');

      expect(userModel.findOne).toHaveBeenCalledWith({
        $or: [
          { email: validSignupDto.email },
          { username: validSignupDto.username },
          { mobileNumber: validSignupDto.mobileNumber },
        ],
      });
      expect(result.user).toEqual({
        accessToken: 'mock-access-token',
      });
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(tokensService.generateAccessToken).toHaveBeenCalled();
      expect(tokensService.generateRefreshToken).toHaveBeenCalled();
      expect(tokensService.storeRefreshToken).toHaveBeenCalledWith(
        'mock-refresh-token',
        newUser._id.toString(),
        'Mozilla/5.0',
        '127.0.0.1',
      );
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        newUser.email,
        validSignupDto.firstName,
      );
    });

    it('should successfully create user without userAgent and ipAddress', async () => {
      const newUser = mockUser({ ...validSignupDto });
      userModel.findOne.mockResolvedValue(null);
      userModel.mockImplementation(() => ({
        ...newUser,
        save: jest.fn().mockResolvedValue(newUser),
      }));

      const result = await service.signup(validSignupDto);

      expect(result.user.accessToken).toBe('mock-access-token');
      expect(tokensService.storeRefreshToken).toHaveBeenCalledWith(
        'mock-refresh-token',
        newUser._id.toString(),
        undefined,
        undefined,
      );
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        newUser.email,
        validSignupDto.firstName,
      );
    });

    it('should still succeed when welcome email fails', async () => {
      const newUser = mockUser({ ...validSignupDto });
      userModel.findOne.mockResolvedValue(null);
      userModel.mockImplementation(() => ({
        ...newUser,
        save: jest.fn().mockResolvedValue(newUser),
      }));
      mailService.sendWelcomeEmail.mockRejectedValueOnce(new Error('SES error'));

      const result = await service.signup(validSignupDto);

      expect(result.user.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        newUser.email,
        validSignupDto.firstName,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const existingUser = mockUser({ email: validSignupDto.email });
      userModel.findOne.mockResolvedValue(existingUser);

      await expect(service.signup(validSignupDto)).rejects.toThrow(
        new ConflictException('User with this email already exists'),
      );
    });

    it('should throw ConflictException for duplicate username', async () => {
      const existingUser = mockUser({
        email: 'different@example.com',
        username: validSignupDto.username,
      });
      userModel.findOne.mockResolvedValue(existingUser);

      await expect(service.signup(validSignupDto)).rejects.toThrow(
        new ConflictException('Username is already taken'),
      );
    });

    it('should throw ConflictException for duplicate mobile number', async () => {
      const existingUser = mockUser({
        email: 'different@example.com',
        username: 'differentuser',
        mobileNumber: validSignupDto.mobileNumber,
      });
      userModel.findOne.mockResolvedValue(existingUser);

      await expect(service.signup(validSignupDto)).rejects.toThrow(
        new ConflictException('Mobile number is already registered'),
      );
    });
  });

  describe('login', () => {
    it('should successfully login with email', async () => {
      const user = mockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      userModel.findOne.mockResolvedValue(user);

      const result = await service.login(validLoginDto, 'Mozilla/5.0', '127.0.0.1');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: validLoginDto.email.toLowerCase() });
      expect(user.comparePassword).toHaveBeenCalledWith(validLoginDto.password);
      expect(result.user).toEqual({
        accessToken: 'mock-access-token',
      });
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should successfully login with username', async () => {
      const user = mockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      userModel.findOne.mockResolvedValue(user);

      const result = await service.login(validLoginWithUsernameDto, 'Mozilla/5.0', '127.0.0.1');

      expect(userModel.findOne).toHaveBeenCalledWith({
        username: validLoginWithUsernameDto.username.toLowerCase(),
      });
      expect(result.user.accessToken).toBe('mock-access-token');
    });

    it('should successfully login with mobile number', async () => {
      const user = mockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      userModel.findOne.mockResolvedValue(user);

      const result = await service.login(validLoginWithMobileDto, 'Mozilla/5.0', '127.0.0.1');

      expect(userModel.findOne).toHaveBeenCalledWith({
        mobileNumber: validLoginWithMobileDto.mobileNumber,
      });
      expect(result.user.accessToken).toBe('mock-access-token');
    });

    it('should successfully login without userAgent and ipAddress', async () => {
      const user = mockUser({ comparePassword: jest.fn().mockResolvedValue(true) });
      userModel.findOne.mockResolvedValue(user);

      await service.login(validLoginDto);

      expect(tokensService.storeRefreshToken).toHaveBeenCalledWith(
        'mock-refresh-token',
        user._id.toString(),
        undefined,
        undefined,
      );
    });

    it('should throw NotFoundException if user not found with email', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(validLoginDto)).rejects.toThrow(
        new NotFoundException('Invalid credentials'),
      );
    });

    it('should throw NotFoundException if user not found with username', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(validLoginWithUsernameDto)).rejects.toThrow(
        new NotFoundException('Invalid credentials'),
      );
    });

    it('should throw NotFoundException if user not found with mobile', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(validLoginWithMobileDto)).rejects.toThrow(
        new NotFoundException('Invalid credentials'),
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const user = mockUser({ comparePassword: jest.fn().mockResolvedValue(false) });
      userModel.findOne.mockResolvedValue(user);

      await expect(service.login(validLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should not send email when user does not exist', async () => {
      userModel.findOne.mockResolvedValue(null);

      await service.requestPasswordReset('missing@example.com');

      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should set token, save user, and send email when user exists', async () => {
      const user = mockUser() as ReturnType<typeof mockUser> & {
        passwordResetTokenHash?: string;
        passwordResetExpires?: Date;
      };
      user.save = jest.fn().mockResolvedValue(user);
      userModel.findOne.mockResolvedValue(user);

      await service.requestPasswordReset(user.email);

      expect(user.passwordResetTokenHash).toBeDefined();
      expect(user.passwordResetExpires).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        user.email,
        expect.stringMatching(/^http:\/\/localhost:5173\/reset-password\?token=/),
      );
    });

    it('should clear token and throw when email send fails', async () => {
      const user = mockUser() as ReturnType<typeof mockUser> & {
        passwordResetTokenHash?: string;
        passwordResetExpires?: Date;
      };
      user.save = jest.fn().mockResolvedValue(user);
      userModel.findOne.mockResolvedValue(user);
      mailService.sendPasswordResetEmail.mockRejectedValueOnce(new Error('SES error'));

      await expect(service.requestPasswordReset(user.email)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(user.passwordResetTokenHash).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
      expect(user.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetPassword', () => {
    it('should update password, clear reset fields, and revoke refresh tokens', async () => {
      const plainToken = randomBytes(16).toString('base64url');
      const tokenHash = createHash('sha256').update(plainToken).digest('hex');
      const user = mockUser({
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: new Date(Date.now() + 3600000),
      }) as ReturnType<typeof mockUser> & {
        passwordResetTokenHash?: string;
        passwordResetExpires?: Date;
      };
      user.save = jest.fn().mockResolvedValue(user);
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await service.resetPassword(plainToken, 'newPassword1');

      expect(user.password).toBe('newPassword1');
      expect(user.passwordResetTokenHash).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
      expect(user.save).toHaveBeenCalled();
      expect(tokensService.revokeAllUserTokens).toHaveBeenCalledWith(user._id.toString());
    });

    it('should throw BadRequestException for invalid token', async () => {
      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.resetPassword('bad-token', 'newPassword1')).rejects.toThrow(
        BadRequestException,
      );
      expect(tokensService.revokeAllUserTokens).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      const decoded = { id: '507f1f77bcf86cd799439011' };
      const user = mockUser();
      tokensService.verifyRefreshToken.mockResolvedValue(decoded);
      userModel.findById.mockResolvedValue(user);

      const result = await service.refreshAccessToken('valid-refresh-token');

      expect(tokensService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(userModel.findById).toHaveBeenCalledWith(decoded.id);
      expect(result).toBe('mock-access-token');
    });

    it('should throw NotFoundException if user not found', async () => {
      const decoded = { id: '507f1f77bcf86cd799439011' };
      tokensService.verifyRefreshToken.mockResolvedValue(decoded);
      userModel.findById.mockResolvedValue(null);

      await expect(service.refreshAccessToken('valid-refresh-token')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout with token', async () => {
      await service.logout('valid-refresh-token');

      expect(tokensService.revokeRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should handle logout without token', async () => {
      await service.logout(null);

      expect(tokensService.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('logoutAllDevices', () => {
    it('should successfully logout from all devices', async () => {
      const userId = '507f1f77bcf86cd799439011';

      await service.logoutAllDevices(userId);

      expect(tokensService.revokeAllUserTokens).toHaveBeenCalledWith(userId);
    });
  });
});
