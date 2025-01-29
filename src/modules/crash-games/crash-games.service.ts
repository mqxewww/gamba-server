import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
import { RegisterCrashGameDTO } from "~modules/crash-games/dto/inbound/register-crash-game.dto";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { User } from "~modules/users/entities/user.entity";

@Injectable()
export class CrashGamesService {
  public constructor(private readonly em: EntityManager) {}

  public async registerCrashGame(body: RegisterCrashGameDTO): Promise<boolean> {
    const crashGame = this.em.create(CrashGame, {
      seed: CrashGameHelper.generateRandomSeed()
    });

    const crashGameBets: CrashGameBet[] = [];

    for (const bet of body.bets) {
      const user = await this.em.findOneOrFail(User, { uuid: bet.uuid });

      crashGameBets.push(
        this.em.create(CrashGameBet, {
          amount: bet.amount,
          auto_cashout: bet.auto_cashout,
          hasCrashed: false,
          user,
          crashGame
        })
      );
    }

    await this.em.persistAndFlush(crashGameBets);

    return true;
  }
}
