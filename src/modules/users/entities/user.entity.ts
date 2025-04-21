import { Collection, Entity, OneToMany, OneToOne, Property, type Rel } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { Token } from "~modules/auth/entities/token.entity";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";

@Entity({ abstract: true })
export abstract class IsolatedUser extends BaseEntity {
  @Property({ unique: true })
  public name!: string;

  @Property({ unique: true })
  public email!: string;

  @Property()
  public coins!: number;
}

@Entity({ tableName: "users" })
export class User extends IsolatedUser {
  @OneToOne(() => Token, (token) => token.user, { nullable: true, orphanRemoval: true })
  public token?: Rel<Token>;

  @OneToMany(() => CrashGameBet, (crashGameBet) => crashGameBet.user)
  public crashGameBets = new Collection<CrashGameBet>(this);
}
