import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserTemplatesService {
  public constructor(private readonly em: EntityManager) {}
}
