import { Module } from "@nestjs/common";
import { CrashGamesController } from "~modules/crash-games/crash-games.controller";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@Module({
  controllers: [CrashGamesController],
  providers: [CrashGamesService]
})
export class CrashGamesModule {}
