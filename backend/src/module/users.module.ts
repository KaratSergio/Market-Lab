import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Database infrastructure
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { PostgresUserRepository } from '@infrastructure/database/postgres/users/user.repository';


@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PostgresUserRepository,
    },
  ],
  exports: ['UserRepository'],
})
export class UsersModule { }