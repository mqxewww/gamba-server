import { Collection, Entity, Enum, OneToMany, Property, type Rel } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { Bet } from "~modules/crash-games/entities/bet.entity";
import { CrashGameState } from "~modules/crash-games/enums/crash-game-state.enum";

@Entity({ abstract: true })
export class IsolatedCrashGame extends BaseEntity {
  @Enum(() => CrashGameState)
  public state!: Rel<CrashGameState>;

  @Property()
  public seed!: string;
}

@Entity({ tableName: "crash-games" })
export class CrashGame extends IsolatedCrashGame {
  @OneToMany(() => Bet, (bet) => bet.crashGame)
  public bets = new Collection<Bet>(this);
}
