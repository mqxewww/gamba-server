import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";

@Entity({ abstract: true })
export abstract class IsolatedUser extends BaseEntity {
  @Property({ unique: true })
  public name!: string;

  @Property({ unique: true })
  public code!: string;

  @Property()
  public coins!: number;
}

@Entity({ tableName: "users" })
export class User extends IsolatedUser {
  @OneToMany(() => CrashGameBet, (crashGameBet) => crashGameBet.user)
  public crashGameBets = new Collection<CrashGameBet>(this);
}
