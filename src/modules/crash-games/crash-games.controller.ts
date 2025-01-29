import { Body, Controller, Post } from "@nestjs/common";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { RegisterCrashGameDTO } from "~modules/crash-games/dto/inbound/register-crash-game.dto";

@Controller("crash-games")
export class CrashGamesController {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @Post("register-crash-game")
  public async registerCrashGame(@Body() body: RegisterCrashGameDTO): Promise<boolean> {
    return await this.crashGamesService.registerCrashGame(body);
  }
}
