import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ abstract: true })
export abstract class BaseEntity {
  public [OptionalProps]?: "id" | "uuid" | "created_at" | "updated_at";

  @PrimaryKey({ autoincrement: true })
  public id!: number;

  @Property({ length: 36, defaultRaw: "(UUID())", unique: true })
  public uuid!: string;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  public created_at!: Date;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP", onUpdate: () => new Date() })
  public updated_at!: Date;
}
