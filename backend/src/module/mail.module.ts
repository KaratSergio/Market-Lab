import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from '@infrastructure/mail/mail.service';
import { SendinblueMailAdapter } from '@infrastructure/mail/mail.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    SendinblueMailAdapter,
    {
      provide: 'MailAdapter',
      useClass: SendinblueMailAdapter,
    },
  ],
  exports: ['MailAdapter'],
})
export class MailModule { }