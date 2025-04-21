import {
  BeforeCreate,
  Entity,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  type Rel
} from "@mikro-orm/core";
import { User } from "~modules/users/entities/user.entity";

@Entity({ abstract: true })
export abstract class IsolatedToken {
  public [OptionalProps]?: "id" | "created_at" | "expires_at" | "token";

  @PrimaryKey({ autoincrement: true })
  public id!: number;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  public created_at!: Date;

  @Property()
  public expires_at!: Date;

  @Property({ length: 36, defaultRaw: "(UUID())", unique: true })
  public token!: string;

  @BeforeCreate()
  setExpiry() {
    const now = new Date().getTime();

    this.expires_at = new Date(now + 60 * 60 * 1000);
  }
}

@Entity({ tableName: "tokens" })
export class Token extends IsolatedToken {
  @OneToOne(() => User, (user) => user.token, { unique: true, owner: true })
  public user!: Rel<User>;
}
