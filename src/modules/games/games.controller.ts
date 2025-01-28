import { Controller } from "@nestjs/common";
import { GamesService } from "~modules/games/games.service";

@Controller("games")
export class GamesController {
  public constructor(private readonly gamesService: GamesService) {}
}
