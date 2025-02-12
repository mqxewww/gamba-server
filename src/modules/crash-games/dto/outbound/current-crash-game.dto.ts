import { CrashGameBetMinifiedDTO } from "~modules/crash-games/dto/outbound/crash-game-bet.dto";
import { CrashGameMinifiedDTO } from "~modules/crash-games/dto/outbound/crash-game.dto";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";

export class CurrentCrashGameDTO {
  public constructor(
    public readonly currentCrashGame: CrashGameMinifiedDTO | null,
    public readonly bets: CrashGameBetMinifiedDTO[]
  ) {}

  public static build(
    currentCrashGame: CrashGame | null,
    bets: CrashGameBet[]
  ): CurrentCrashGameDTO {
    return new CurrentCrashGameDTO(
      currentCrashGame ? CrashGameMinifiedDTO.build(currentCrashGame) : null,
      bets.map((bet) => CrashGameBetMinifiedDTO.build(bet))
    );
  }
}
