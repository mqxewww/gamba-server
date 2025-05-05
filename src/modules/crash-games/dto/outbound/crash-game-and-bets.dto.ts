import { BetDTO } from "~modules/crash-games/dto/outbound/bet.dto";
import { CrashGameDTO } from "~modules/crash-games/dto/outbound/crash-game.dto";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";

export class CrashGameAndBetsDTO {
  public constructor(
    public readonly crashGame: CrashGameDTO | null,
    public readonly bets: BetDTO[]
  ) {}

  public static build(crashGame: CrashGame | null): CrashGameAndBetsDTO {
    return crashGame
      ? new CrashGameAndBetsDTO(
          CrashGameDTO.build(crashGame),
          crashGame.bets.map((bet) => BetDTO.build(bet))
        )
      : new CrashGameAndBetsDTO(null, []);
  }
}
