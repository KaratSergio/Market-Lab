import { Module } from '@nestjs/common';
import { MailModule } from './mail.module';
import { NotificationService } from '@domain/notifications/notification.service';

@Module({
  imports: [MailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }