import { Module } from "@nestjs/common";
import { AuthService } from "~modules/auth/auth.service";
import { CrashGamesGateway } from "~modules/crash-games/crash-games.gateway";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { UsersService } from "~modules/users/users.service";

@Module({
  providers: [CrashGamesGateway, CrashGamesService, UsersService, AuthService]
})
export class CrashGamesModule {}
