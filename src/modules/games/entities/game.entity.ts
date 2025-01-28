import { Collection, Entity, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { User } from "~modules/users/entities/user.entity";

@Entity({ abstract: true })
export abstract class IsolatedGame extends BaseEntity {}

@Entity({ tableName: "games" })
export class Game extends IsolatedGame {
  @OneToMany(() => User, (user) => user.game)
  public users = new Collection<User>(this);
}
