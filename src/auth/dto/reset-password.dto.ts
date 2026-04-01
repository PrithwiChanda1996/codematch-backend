import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from the email link',
    example: 'abc123...',
  })
  @IsString({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'New password (min 6 characters)',
    example: 'NewSecurePass1',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
