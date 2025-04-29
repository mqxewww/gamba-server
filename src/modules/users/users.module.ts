import { Module } from "@nestjs/common";
import { AuthService } from "~modules/auth/auth.service";
import { UsersGateway } from "~modules/users/users.gateway";
import { UsersService } from "~modules/users/users.service";

@Module({
  providers: [UsersGateway, UsersService, AuthService]
})
export class UsersModule {}
