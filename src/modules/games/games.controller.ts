import { Body, Controller, Post } from "@nestjs/common";
import { CreateGameDTO } from "~modules/games/dto/inbound/create-game.dto";
import { StartGameDTO } from "~modules/games/dto/inbound/start-game.dto";
import { GameDTO } from "~modules/games/dto/outbound/game.dto";
import { GamesService } from "~modules/games/games.service";

@Controller("games")
export class GamesController {
  public constructor(private readonly gamesService: GamesService) {}

  @Post("create-game")
  public async createGame(@Body() body: CreateGameDTO): Promise<GameDTO> {
    return await this.gamesService.createGame(body);
  }

  @Post("start-game")
  public async startGame(@Body() body: StartGameDTO): Promise<boolean> {
    return await this.gamesService.startGame(body);
  }
}
