import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
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

  public constructor(private readonly em: EntityManager) {}

  public async handleConnection(
    _client: Socket,
    server: Server
  ): Promise<[CurrentCrashGameDTO, boolean]> {
    const currentCrashGame = await this.getCurrentCrashGame();
    let updateOtherUsers = false;

    if (CrashGameHelper.shouldCreateNewCrashGame(server, currentCrashGame, this.MIN_CLIENT)) {
      await this.createPendingCrashGame(server);
      updateOtherUsers = true;
    }

    return [CurrentCrashGameDTO.build(currentCrashGame), updateOtherUsers];
  }

  public handleDisconnect(client: Socket, server: Server): void {
    console.log(`${client.id} left, ${server.sockets.sockets.size} client(s) online.`);
  }

  public async handleAddBet(
    client: Socket,
    message: HandleAddBetDTO
  ): Promise<CurrentCrashGameDTO> {
    const currentCrashGame = await this.getCurrentCrashGame();

    if (!currentCrashGame || currentCrashGame.state !== CrashGameStateEnum.PENDING) {
      client.emit("crash-game/add-bet-reply", false);

      throw new Error("crash-game/add-bet-reply error");
    }

    const user = await this.em.findOneOrFail(User, { uuid: message.user_uuid });

    if (
      currentCrashGame.bets.find((bet) => bet.user.uuid === user.uuid) ||
      message.amount > user.coins
    ) {
      client.emit("crash-game/add-bet-reply", false);

      throw new Error("crash-game/add-bet-reply error");
    }

    const bet = this.em.create(CrashGameBet, {
      user,
      amount: message.amount,
      auto_cashout: message.auto_cashout,
      state: CrashGameBetStateEnum.NOT_REGISTERED,
      crashGame: currentCrashGame
    });

    await this.em.persistAndFlush(bet);

    return CurrentCrashGameDTO.build(currentCrashGame);
  }

  public async getCurrentCrashGame(): Promise<CrashGame | null> {
    const currentCrashGame = await this.em.find(CrashGame, {}, { populate: ["bets"], limit: 1 });

    return currentCrashGame[0] ? currentCrashGame[0] : null;
  }

  public async createPendingCrashGame(server: Server): Promise<CrashGame> {
    const crashGame = this.em.create(CrashGame, {
      seed: CrashGameHelper.generateRandomSeed(),
      state: CrashGameStateEnum.PENDING
    });

    await this.em.persistAndFlush(crashGame);

    const now = new Date();
    const currentMilliseconds = now.getMilliseconds();

    const timeToNextSecond = 1000 - currentMilliseconds;

    const targetTime = new Date(now.getTime() + 19000 + timeToNextSecond);

    const delay = targetTime.getTime() - now.getTime();

    setTimeout(() => this.registerBetsAndStart(server), delay);

    return crashGame;
  }

  public async registerBetsAndStart(server: Server): Promise<void> {
    const currentCrashGame = await this.getCurrentCrashGame();

    if (!currentCrashGame) throw new Error("Crash Game should be defined !!");

    for (const bet of currentCrashGame.bets) {
      bet.state = CrashGameBetStateEnum.PENDING;
      bet.user.coins -= bet.amount;

      await this.em.persistAndFlush(bet);
    }

    currentCrashGame.state = CrashGameStateEnum.IN_PROGRESS;

    await this.em.persistAndFlush(currentCrashGame);

    server.emit("crash-game/data", CurrentCrashGameDTO.build(currentCrashGame));
  }

  public async onCrashGameReachingCrash() {}
}
