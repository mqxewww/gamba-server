import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GamesService {
  public constructor(private readonly em: EntityManager) {}
}
