import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameState } from "~modules/crash-games/enums/crash-game-state.enum";

export class CrashGameDTO {
  public constructor(
    public readonly uuid: string,
    public readonly created_at: Date,
    public readonly state: CrashGameState
  ) {}

  public static build(game: CrashGame) {
    return new CrashGameDTO(game.uuid, game.created_at, game.state);
  }
}
