import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";

export class CrashGameMinifiedDTO {
  public constructor(
    public readonly uuid: string,
    public readonly created_at: Date,
    public readonly state: CrashGameStateEnum
  ) {}

  public static build(game: CrashGame) {
    return new CrashGameMinifiedDTO(game.uuid, game.created_at, game.state);
  }
}
