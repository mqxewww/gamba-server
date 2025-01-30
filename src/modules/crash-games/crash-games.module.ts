import { Module } from "@nestjs/common";
import { CrashGamesController } from "~modules/crash-games/crash-games.controller";
import { CrashGamesGateway } from "~modules/crash-games/crash-games.gateway";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@Module({
  controllers: [CrashGamesController],
  providers: [CrashGamesGateway, CrashGamesService]
})
export class CrashGamesModule {}
