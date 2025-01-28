import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { Game } from "~modules/games/entities/game.entity";

@Entity({ abstract: true })
export abstract class IsolatedUser extends BaseEntity {
  @Property()
  public name!: string;

  @Property()
  public coins!: number;
}

@Entity({ tableName: "users" })
export class User extends IsolatedUser {
  @ManyToOne(() => Game)
  public game!: Game;
}
