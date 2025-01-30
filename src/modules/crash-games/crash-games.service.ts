import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";
import { RegisterBetsAndStartType } from "~types/register-bets-and-start.type";

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

  public async registerBetsAndStart(body: RegisterBetsAndStartType): Promise<boolean> {
    const crashGame = await this.em.findOneOrFail(CrashGame, {
      uuid: body.game_uuid,
      state: CrashGameStateEnum.PENDING
    });

    const crashGameBets: CrashGameBet[] = [];

    for (const bet of body.bets) {
      crashGameBets.push(
        this.em.create(CrashGameBet, {
          amount: bet.amount,
          auto_cashout: bet.auto_cashout,
          hasCrashed: false,
          user: bet.user,
          crashGame
        })
      );
    }

    await this.em.persistAndFlush(crashGameBets);

    return true;
  }
}
