import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { Game } from "~modules/games/entities/game.entity";

@Entity({ abstract: true })
export class IsolatedCrashGame extends BaseEntity {
  @Property()
  public seed!: string;
}

@Entity({ tableName: "crash-games" })
export class CrashGame extends IsolatedCrashGame {
  @OneToMany(() => CrashGameBet, (crashGameBet) => crashGameBet.crashGame)
  public bets = new Collection<CrashGameBet>(this);

  @ManyToOne(() => Game)
  public game!: Game;
}
