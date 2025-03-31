import { Module } from "@nestjs/common";
import { CrashGamesGateway } from "~modules/crash-games/crash-games.gateway";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@Module({
  providers: [CrashGamesGateway, CrashGamesService]
})
export class CrashGamesModule {}
