import { Module } from "@nestjs/common";
import { AppService } from "src/app.service";
import { UsersGateway } from "~modules/users/users.gateway";
import { UsersService } from "~modules/users/users.service";

@Module({
  providers: [UsersGateway, UsersService, AppService]
})
export class UsersModule {}
