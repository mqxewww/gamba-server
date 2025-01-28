import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "user-templates" })
export class UserTemplate {
  @PrimaryKey({ autoincrement: true })
  public id!: number;

  @Property({ unique: true })
  public name!: string;
}
