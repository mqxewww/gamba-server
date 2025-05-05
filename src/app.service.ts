import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AppEvents } from "~common/enums/app-events.enum";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { BetStatus } from "~modules/crash-games/enums/bet-status.enum";
import { CrashGameState } from "~modules/crash-games/enums/crash-game-state.enum";

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  public constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2
  ) {}

  public async onStartup(): Promise<void> {
    this.logger.log(`[${this.onStartup.name}] process currently running`);

    const latestCrashGame = await this.em.findOne(
      CrashGame,
      { created_at: { $ne: null } },
      { orderBy: { created_at: "DESC" }, populate: ["bets"] }
    );

    switch (true) {
      case !latestCrashGame || latestCrashGame.state === CrashGameState.FINISHED:
        this.logger.log(`[${this.onStartup.name}] process, no problems found`);
        break;

      case latestCrashGame?.state === CrashGameState.PENDING:
        this.logger.warn(
          `[${this.onStartup.name}] process, latestCrashGame was in a PENDING state, deleted it`
        );

        this.em.removeAndFlush(latestCrashGame);
        break;

      case latestCrashGame?.state === CrashGameState.IN_PROGRESS:
        this.logger.warn(
          `[${this.onStartup.name}] process, latestCrashGame was in a IN_PROGRESS state, deleted it and refunded every bets`
        );

        for (const bet of latestCrashGame.bets) {
          if (bet.status !== BetStatus.NOT_REGISTERED) bet.user.coins += bet.amount;
        }

        this.em.removeAndFlush(latestCrashGame);
        break;
    }

    this.eventEmitter.emit(AppEvents.CRASH_GAME_CREATE);
  }
}
