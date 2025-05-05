import { Entity, Enum, ManyToOne, Property, type Rel } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { BetStatus } from "~modules/crash-games/enums/bet-status.enum";
import { User } from "~modules/users/entities/user.entity";

@Entity({ abstract: true })
export class IsolatedBet extends BaseEntity {
  @Enum(() => BetStatus)
  public status!: Rel<BetStatus>;

  @Property()
  public amount!: number;

  @Property({ nullable: true })
  public cashedOutAt?: number;
}

@Entity({ tableName: "crash-game-bets" })
export class Bet extends IsolatedBet {
  @ManyToOne(() => User)
  public user!: Rel<User>;

  @ManyToOne(() => CrashGame)
  public crashGame!: Rel<CrashGame>;
}
