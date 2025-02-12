import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";

export class CrashGameMinifiedDTO {
  public constructor(
    public readonly uuid: string,
    public readonly created_at: Date
  ) {}

  public static build(game: CrashGame) {
    return new CrashGameMinifiedDTO(game.uuid, game.created_at);
  }
}
