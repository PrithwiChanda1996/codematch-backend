import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client: SESClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SESClient({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const fromEmail = this.configService.get<string>('ses.fromEmail');
    if (!fromEmail) {
      this.logger.error('SES_FROM_EMAIL is not configured');
      throw new Error('Email service is not configured');
    }

    const body = [
      'You requested a password reset for your codematch account.',
      '',
      `Open this link to choose a new password (it expires in one hour):`,
      resetLink,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');

    await this.client.send(
      new SendEmailCommand({
        Source: fromEmail,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: {
            Data: 'Reset your codematch password',
            Charset: 'UTF-8',
          },
          Body: {
            Text: { Data: body, Charset: 'UTF-8' },
          },
        },
      }),
    );
  }
}
