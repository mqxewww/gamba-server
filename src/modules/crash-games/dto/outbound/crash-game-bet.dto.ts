import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";

export class CrashGameBetMinifiedDTO {
  public constructor(
    public readonly uuid: string,
    public readonly user_name: string,
    public readonly state: CrashGameBetStateEnum,
    public readonly amount: number,
    public readonly cashedOutAt: number | null
  ) {}

  public static build(bet: CrashGameBet): CrashGameBetMinifiedDTO {
    return new CrashGameBetMinifiedDTO(
      bet.uuid,
      bet.user.name,
      bet.state,
      bet.amount,
      bet.cashedOutAt ?? null
    );
  }
}
