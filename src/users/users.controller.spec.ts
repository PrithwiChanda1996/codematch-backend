import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mockUser } from '../../test/helpers/mock-factories';
import { validUpdateUserDto } from '../../test/helpers/test-fixtures';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByMobile: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user with success response', async () => {
      const user = mockUser();
      usersService.findById.mockResolvedValue(user as any);

      const result = await controller.getUserById('507f1f77bcf86cd799439011');

      expect(usersService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({
        success: true,
        data: user,
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return user with success response', async () => {
      const user = mockUser();
      usersService.findByEmail.mockResolvedValue(user as any);

      const result = await controller.getUserByEmail('john.doe@example.com');

      expect(usersService.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(result).toEqual({
        success: true,
        data: user,
      });
    });
  });

  describe('getUserByMobile', () => {
    it('should return user with success response', async () => {
      const user = mockUser();
      usersService.findByMobile.mockResolvedValue(user as any);

      const result = await controller.getUserByMobile('9876543210');

      expect(usersService.findByMobile).toHaveBeenCalledWith('9876543210');
      expect(result).toEqual({
        success: true,
        data: user,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return success response', async () => {
      const updatedUser = { ...mockUser(), ...validUpdateUserDto };
      usersService.updateProfile.mockResolvedValue(updatedUser as any);

      const userId = '507f1f77bcf86cd799439011';

      const result = await controller.updateProfile(userId, validUpdateUserDto);

      expect(usersService.updateProfile).toHaveBeenCalledWith(userId, validUpdateUserDto);
      expect(result).toEqual({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    });
  });
});

