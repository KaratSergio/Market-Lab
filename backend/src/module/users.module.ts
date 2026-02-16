import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { PostgresUserRepository } from '@infrastructure/database/postgres/users/user.repository';

import { UserService } from '@auth/services/user.service';
import { EncryptModule } from '@auth/encrypt/encrypt.module';


@Module({
  imports: [
    EncryptModule,
    TypeOrmModule.forFeature([UserOrmEntity])
  ],
  providers: [
    UserService,
    PostgresUserRepository,
    {
      provide: 'UserRepository',
      useClass: PostgresUserRepository,
    },
  ],
  exports: [
    UserService,
    'UserRepository',
    PostgresUserRepository,
  ],
})
export class UsersModule { }