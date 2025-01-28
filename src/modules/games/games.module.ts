import { Module } from "@nestjs/common";
import { GamesController } from "~modules/games/games.controller";
import { GamesService } from "~modules/games/games.service";

@Module({
  controllers: [GamesController],
  providers: [GamesService]
})
export class GamesModule {}
