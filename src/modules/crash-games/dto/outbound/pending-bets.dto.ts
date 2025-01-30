import { User } from "~modules/users/entities/user.entity";

export class PendingBet {
  public constructor(
    public readonly user: User,
    public readonly amount: number,
    public readonly auto_cashout: number
  ) {}
}

export class PendingBetMinifiedDTO {
  public constructor(
    public readonly user_name: string,
    public readonly amount: number,
    public readonly auto_cashout: number
  ) {}

  public static build(pendingBet: PendingBet): PendingBetMinifiedDTO {
    return new PendingBetMinifiedDTO(
      pendingBet.user.name,
      pendingBet.amount,
      pendingBet.auto_cashout
    );
  }
}
