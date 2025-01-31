import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { User } from "~modules/users/entities/user.entity";

@Entity({ abstract: true })
export class IsolatedCrashGameBet extends BaseEntity {
  @Property()
  public amount!: number;

  @Property()
  public auto_cashout!: number;

  @Enum(() => CrashGameBetStateEnum)
  public state!: CrashGameBetStateEnum;
}

@Entity({ tableName: "crash-game-bets" })
export class CrashGameBet extends IsolatedCrashGameBet {
  @ManyToOne(() => User)
  public user!: User;

  @ManyToOne(() => CrashGame)
  public crashGame!: CrashGame;
}
