import { Controller } from "@nestjs/common";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@Controller("crash-games")
export class CrashGamesController {
  public constructor(private readonly crashGamesService: CrashGamesService) {}
}
