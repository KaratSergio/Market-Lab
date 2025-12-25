import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Config {
  constructor(private configService: ConfigService) { }

  get endpoint(): string {
    return this.configService.get<string>('S3_ENDPOINT')!;
  }

  get accessKey(): string {
    return this.configService.get<string>('S3_ACCESS_KEY')!;
  }

  get secretKey(): string {
    return this.configService.get<string>('S3_SECRET_KEY')!;
  }

  get bucket(): string {
    return this.configService.get<string>('S3_BUCKET')!;
  }

  get publicUrl(): string {
    return this.configService.get<string>('S3_PUBLIC_URL')!;
  }

  get region(): string {
    return 'auto'; // Cloudflare R2 -> 'auto'
  }
}