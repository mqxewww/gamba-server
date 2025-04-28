import { Module } from "@nestjs/common";
import { AppService } from "src/app.service";
import { AuthService } from "~modules/auth/auth.service";
import { CrashGamesGateway } from "~modules/crash-games/crash-games.gateway";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@Module({
  providers: [CrashGamesGateway, CrashGamesService, AppService, AuthService]
})
export class CrashGamesModule {}
