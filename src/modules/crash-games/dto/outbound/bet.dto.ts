import { Bet } from "~modules/crash-games/entities/bet.entity";
import { BetStatus } from "~modules/crash-games/enums/bet-status.enum";

export class BetDTO {
  public constructor(
    public readonly uuid: string,
    public readonly status: BetStatus,
    public readonly amount: number,
    public readonly cashedOutAt: number | null,
    public readonly username: string
  ) {}

  public static build(bet: Bet): BetDTO {
    return new BetDTO(bet.uuid, bet.status, bet.amount, bet.cashedOutAt ?? null, bet.user.name);
  }
}
