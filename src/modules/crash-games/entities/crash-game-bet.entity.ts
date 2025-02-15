import { Entity, Enum, ManyToOne, Property, type Rel } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { User } from "~modules/users/entities/user.entity";

@Entity({ abstract: true })
export class IsolatedCrashGameBet extends BaseEntity {
  @Enum(() => CrashGameBetStateEnum)
  public state!: Rel<CrashGameBetStateEnum>;

  @Property()
  public amount!: number;

  @Property({ nullable: true })
  public cashedOutAt?: number;
}

@Entity({ tableName: "crash-game-bets" })
export class CrashGameBet extends IsolatedCrashGameBet {
  @ManyToOne(() => User)
  public user!: Rel<User>;

  @ManyToOne(() => CrashGame)
  public crashGame!: Rel<CrashGame>;
}
