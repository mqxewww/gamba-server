import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
import { WebSocketHelper } from "~common/helpers/ws.helper";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { CurrentCrashGameDTO } from "~modules/crash-games/dto/outbound/current-crash-game.dto";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";
import { User } from "~modules/users/entities/user.entity";

@Injectable()
export class CrashGamesService {
  public readonly MIN_CLIENT = 3;
  public readonly bets = new Array<CrashGameBet>();
  public currentCrashGame: CrashGame | null = null;

  public constructor(private readonly em: EntityManager) {}

  public async handleConnection(server: Server, client: Socket): Promise<CurrentCrashGameDTO> {
    if (this.shouldCreateNewCrashGame(server)) {
      this.currentCrashGame = await this.createPendingCrashGame();
      this.bets.splice(0, this.bets.length);
    }

    return CurrentCrashGameDTO.build(this.currentCrashGame, this.bets);
  }

  public handleDisconnect(client: Socket, server: Server): void {
    console.log(`${client.id} left, ${server.sockets.sockets.size} client(s) online.`);
  }

  public async handleAddBet(client: Socket, message: string): Promise<CurrentCrashGameDTO> {
    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.PENDING) {
      client.emit("crash-game/add-bet-reply", false);
      throw new Error("crash-game/add-bet-reply error");
    }

    const body = await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO);
    const user = await this.em.findOneOrFail(User, { uuid: body.user_uuid });

    if (this.bets.find((bet) => bet.user.uuid === user.uuid) || body.amount > user.coins) {
      client.emit("crash-game/add-bet-reply", false);
      throw new Error("crash-game/add-bet-reply error");
    }

    this.bets.push(
      this.em.create(CrashGameBet, {
        user,
        amount: body.amount,
        auto_cashout: body.auto_cashout,
        state: CrashGameBetStateEnum.PENDING,
        crashGame: this.currentCrashGame
      })
    );

    return CurrentCrashGameDTO.build(this.currentCrashGame, this.bets);
  }

  public async createPendingCrashGame(): Promise<CrashGame> {
    const crashGame = this.em.create(CrashGame, {
      seed: CrashGameHelper.generateRandomSeed(),
      state: CrashGameStateEnum.PENDING
    });

    await this.em.persistAndFlush(crashGame);

    return crashGame;
  }

  public shouldCreateNewCrashGame(server: Server): boolean {
    if (!this.currentCrashGame) {
      if (server.sockets.sockets.size >= this.MIN_CLIENT) return true;

      return false;
    }

    return this.currentCrashGame.state === CrashGameStateEnum.FINISHED;
  }

  public async registerBetsAndStart(): Promise<void> {
    await this.em.persistAndFlush(this.bets);
  }
}
