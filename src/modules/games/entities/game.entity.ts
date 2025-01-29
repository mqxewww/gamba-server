import { Collection, Entity, Enum, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { GameStateEnum } from "~modules/games/enums/game-state.enum";
import { User } from "~modules/users/entities/user.entity";

@Entity({ abstract: true })
export abstract class IsolatedGame extends BaseEntity {
  @Enum(() => GameStateEnum)
  public state!: GameStateEnum;
}

@Entity({ tableName: "games" })
export class Game extends IsolatedGame {
  @OneToMany(() => User, (user) => user.game)
  public users = new Collection<User>(this);

  @OneToMany(() => CrashGame, (crashGame) => crashGame.game)
  public crashGames = new Collection<CrashGame>(this);
}
