import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";

@Injectable()
export class CrashGamesService {
  public constructor(private readonly em: EntityManager) {}

  public async createPendingCrashGame(): Promise<CrashGame> {
    const crashGame = this.em.create(CrashGame, {
      seed: CrashGameHelper.generateRandomSeed(),
      state: CrashGameStateEnum.PENDING
    });

    await this.em.persistAndFlush(crashGame);

    return crashGame;
  }
}
