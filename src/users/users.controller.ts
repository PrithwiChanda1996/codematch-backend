import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerGuard } from './guards/owner.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User MongoDB ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    return {
      success: true,
      data: user,
    };
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email address' })
  @ApiParam({ name: 'email', description: 'User email address', example: 'john.doe@example.com' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);

    return {
      success: true,
      data: user,
    };
  }

  @Get('mobile/:mobileNumber')
  @ApiOperation({ summary: 'Get user by mobile number' })
  @ApiParam({ name: 'mobileNumber', description: '10-digit mobile number', example: '9876543210' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByMobile(@Param('mobileNumber') mobileNumber: string) {
    const user = await this.usersService.findByMobile(mobileNumber);

    return {
      success: true,
      data: user,
    };
  }

  @Patch('profile')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Update user profile (own profile only)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateUserDto,
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    };
  }
}

