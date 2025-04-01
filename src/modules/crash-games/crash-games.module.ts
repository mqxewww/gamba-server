import { Module } from "@nestjs/common";
import { AppService } from "src/app.service";
import { CrashGamesGateway } from "~modules/crash-games/crash-games.gateway";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@Module({
  providers: [CrashGamesGateway, CrashGamesService, AppService]
})
export class CrashGamesModule {}
