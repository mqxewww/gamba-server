import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";

export class CrashGameBetMinifiedDTO {
  public constructor(
    public readonly user_name: string,
    public readonly amount: number,
    public readonly auto_cashout: number,
    public readonly state: CrashGameBetStateEnum
  ) {}

  public static build(bet: CrashGameBet): CrashGameBetMinifiedDTO {
    return new CrashGameBetMinifiedDTO(bet.user.name, bet.amount, bet.auto_cashout, bet.state);
  }
}
