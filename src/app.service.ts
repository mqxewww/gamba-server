import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EventEnum } from "~common/enums/event.enum";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);
  private connections = new Map<string, string>();

  public constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2
  ) {}

  public registerClient(clientId: string, namespace: string): void {
    this.connections.set(clientId, namespace);

    this.logger.log(`Register client ${clientId} inside ${namespace} namespace`);
    this.logger.log(`Total connections: ${this.connections.size}`);
  }

  public removeClient(clientId: string): void {
    const ns = this.connections.get(clientId);

    this.connections.delete(clientId);

    this.logger.log(`Removed client ${clientId} from ${ns} namespace`);
    this.logger.log(`Total connections: ${this.connections.size}`);
  }

  public getTotalConnections(): number {
    return this.connections.size;
  }

  public async onStartup(): Promise<void> {
    this.logger.log(`onStartup() process currently running`);

    const latestCrashGame = await this.em.findOne(
      CrashGame,
      { created_at: { $ne: null } },
      { orderBy: { created_at: "DESC" }, populate: ["bets"] }
    );

    switch (true) {
      case !latestCrashGame || latestCrashGame.state === CrashGameStateEnum.FINISHED:
        this.logger.log(`onStartup() process, no problems found`);
        break;

      case latestCrashGame?.state === CrashGameStateEnum.PENDING:
        this.logger.warn(`onStartup() process, latestCrashGame was in a PENDING state, deleted it`);

        this.em.removeAndFlush(latestCrashGame);
        break;

      case latestCrashGame?.state === CrashGameStateEnum.IN_PROGRESS:
        this.logger.warn(
          `onStartup() process, latestCrashGame was in a IN_PROGRESS state, deleted it and refunded every bets`
        );

        for (const bet of latestCrashGame.bets) {
          if (bet.state !== CrashGameBetStateEnum.NOT_REGISTERED) bet.user.coins += bet.amount;
        }

        this.em.removeAndFlush(latestCrashGame);
        break;
    }

    this.eventEmitter.emit(EventEnum.CG_CREATE);
  }
}
