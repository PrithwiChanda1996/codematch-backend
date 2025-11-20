import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { createMockModel, mockUser } from '../../test/helpers/mock-factories';
import { validUpdateUserDto } from '../../test/helpers/test-fixtures';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    const mockUserModel = createMockModel(mockUser());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = mockUser();
      const selectMock = jest.fn().mockResolvedValue(user);
      userModel.findById.mockReturnValue({ select: selectMock });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(userModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      userModel.findById.mockReturnValue({ select: selectMock });

      await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = mockUser();
      const selectMock = jest.fn().mockResolvedValue(user);
      userModel.findOne.mockReturnValue({ select: selectMock });

      const result = await service.findByEmail('John.Doe@Example.com');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toEqual(user);
    });

    it('should convert email to lowercase', async () => {
      const user = mockUser();
      const selectMock = jest.fn().mockResolvedValue(user);
      userModel.findOne.mockReturnValue({ select: selectMock });

      await service.findByEmail('TEST@EXAMPLE.COM');

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should throw NotFoundException when user not found', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      userModel.findOne.mockReturnValue({ select: selectMock });

      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('findByMobile', () => {
    it('should return user when found', async () => {
      const user = mockUser();
      const selectMock = jest.fn().mockResolvedValue(user);
      userModel.findOne.mockReturnValue({ select: selectMock });

      const result = await service.findByMobile('9876543210');

      expect(userModel.findOne).toHaveBeenCalledWith({ mobileNumber: '9876543210' });
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      userModel.findOne.mockReturnValue({ select: selectMock });

      await expect(service.findByMobile('1234567890')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const user = {
        ...mockUser(),
        save: jest.fn().mockResolvedValue(true),
      };
      const updatedUser = { ...user, ...validUpdateUserDto };
      
      userModel.findById.mockResolvedValueOnce(user);
      
      const selectMock = jest.fn().mockResolvedValue(updatedUser);
      userModel.findById.mockReturnValueOnce({ select: selectMock });

      const result = await service.updateProfile('507f1f77bcf86cd799439011', validUpdateUserDto);

      expect(userModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(user.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('507f1f77bcf86cd799439011', validUpdateUserDto),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should apply all updates to user object', async () => {
      const user = {
        ...mockUser(),
        firstName: 'Old',
        lastName: 'Name',
        save: jest.fn().mockResolvedValue(true),
      };
      
      userModel.findById.mockResolvedValueOnce(user);
      
      const selectMock = jest.fn().mockResolvedValue({ ...user, ...validUpdateUserDto });
      userModel.findById.mockReturnValueOnce({ select: selectMock });

      const result = await service.updateProfile('507f1f77bcf86cd799439011', validUpdateUserDto);

      expect(user.save).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalledWith('-password');
    });
  });
});

