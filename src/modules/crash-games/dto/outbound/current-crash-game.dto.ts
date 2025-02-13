import { CrashGameBetMinifiedDTO } from "~modules/crash-games/dto/outbound/crash-game-bet.dto";
import { CrashGameMinifiedDTO } from "~modules/crash-games/dto/outbound/crash-game.dto";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";

export class CurrentCrashGameDTO {
  public constructor(
    public readonly currentCrashGame: CrashGameMinifiedDTO | null,
    public readonly bets: CrashGameBetMinifiedDTO[]
  ) {}

  public static build(currentCrashGame: CrashGame | null): CurrentCrashGameDTO {
    return currentCrashGame
      ? new CurrentCrashGameDTO(
          CrashGameMinifiedDTO.build(currentCrashGame),
          currentCrashGame.bets.map((bet) => CrashGameBetMinifiedDTO.build(bet))
        )
      : new CurrentCrashGameDTO(null, []);
  }
}
