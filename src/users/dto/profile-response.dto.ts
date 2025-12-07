import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe123' })
  username: string;

  @ApiProperty({ description: 'Mobile number', example: '+1234567890', required: false })
  mobileNumber?: string;

  @ApiProperty({ description: 'First name', example: 'John', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Age', example: 25, required: false })
  age?: number;

  @ApiProperty({ description: 'Gender', example: 'male', required: false })
  gender?: string;

  @ApiProperty({ description: 'Bio/About', example: 'Software developer', required: false })
  about?: string;

  @ApiProperty({ description: 'Skills array', example: ['JavaScript', 'React'], required: false })
  skills?: string[];

  @ApiProperty({
    description: 'Photo URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  photoUrl?: string;
}
