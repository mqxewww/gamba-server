import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import moment from "moment";
import { Socket } from "socket.io";
import { AppService } from "src/app.service";
import { WebsocketEventsEnum } from "~common/enums/ws-events.enum";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { HandleCashoutDTO } from "~modules/crash-games/dto/inbound/handle-cashout.dto";
import { CurrentCrashGameDTO } from "~modules/crash-games/dto/outbound/current-crash-game.dto";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";
import { User } from "~modules/users/entities/user.entity";

@Injectable()
export class CrashGamesService {
  private readonly logger = new Logger(CrashGamesService.name);
  private currentCrashGame: CrashGame | null = null;

  public constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly appService: AppService
  ) {}

  public async handleConnection(client: Socket): Promise<CurrentCrashGameDTO> {
    this.appService.registerClient(client.id, "crash-games");

    if (
      CrashGameHelper.shouldCreateNewCrashGame(
        this.appService.getTotalConnections(),
        this.currentCrashGame
      )
    )
      this.eventEmitter.emit(WebsocketEventsEnum.CG_EM_CREATE);

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public handleDisconnect(client: Socket): void {
    this.appService.removeClient(client.id);
  }

  public async handleAddBet(
    client: Socket,
    message: HandleAddBetDTO
  ): Promise<CurrentCrashGameDTO> {
    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.PENDING) {
      client.emit(WebsocketEventsEnum.CG_ADD_BET_REPLY, false);

      throw new Error("crash-game/add-bet-reply error");
    }

    const user = await this.em.findOneOrFail(User, { uuid: message.user_uuid });

    if (
      this.currentCrashGame.bets.find((bet) => bet.user.uuid === user.uuid) ||
      message.amount > user.coins
    ) {
      client.emit(WebsocketEventsEnum.CG_ADD_BET_REPLY, false);

      throw new Error("crash-game/add-bet-reply error");
    }

    this.em.create(CrashGameBet, {
      user,
      amount: message.amount,
      state: CrashGameBetStateEnum.NOT_REGISTERED,
      crashGame: this.currentCrashGame
    });

    await this.em.flush();

    this.logger.log(`${user.name} has bet ${message.amount} coins`);

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public async handleCashout(
    client: Socket,
    message: HandleCashoutDTO
  ): Promise<CurrentCrashGameDTO> {
    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.IN_PROGRESS) {
      client.emit(WebsocketEventsEnum.CG_CASHOUT_REPLY, false);

      throw new Error("crash-game/cashout-reply error");
    }

    const userBet = this.currentCrashGame.bets.find((bet) => bet.user.uuid === message.user_uuid);

    if (!userBet || userBet.state !== CrashGameBetStateEnum.PENDING) {
      client.emit(WebsocketEventsEnum.CG_CASHOUT_REPLY, false);

      throw new Error("crash-game/cashout-reply error");
    }

    userBet.state = CrashGameBetStateEnum.CASHED_OUT;

    await this.em.flush();

    userBet.cashedOutAt = CrashGameHelper.getCrashTickFromTime(
      new Date().getTime() - (this.currentCrashGame.created_at.getTime() + 19000)
    );

    userBet.user.coins += userBet.amount * (userBet.cashedOutAt / 100);

    await this.em.flush();

    this.logger.log(
      `${userBet.user.name} cashed out at x${userBet.cashedOutAt / 100}, winning ${userBet.amount * (userBet.cashedOutAt / 100)} coins`
    );

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public async handleCreatePendingGame(): Promise<CurrentCrashGameDTO> {
    const crashGame = this.em.create(CrashGame, {
      seed: CrashGameHelper.generateRandomSeed(),
      state: CrashGameStateEnum.PENDING
    });

    this.currentCrashGame = crashGame;

    await this.em.flush();

    const crashTick = CrashGameHelper.getCrashTickFromSeed(this.currentCrashGame.seed);
    const time = CrashGameHelper.getTimeFromCrashTick(crashTick);

    setTimeout(
      () => this.eventEmitter.emit(WebsocketEventsEnum.CG_EM_START, time),
      20000 - moment().milliseconds()
    );

    this.logger.log(`A new 'crash game' has been created`);

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public async handleRegisterBetsAndStart(time: number): Promise<CurrentCrashGameDTO> {
    if (!this.currentCrashGame) throw new Error("Crash Game should be defined !!");

    this.currentCrashGame.state = CrashGameStateEnum.IN_PROGRESS;

    for (const bet of this.currentCrashGame.bets) {
      bet.state = CrashGameBetStateEnum.PENDING;
      bet.user.coins -= bet.amount;
    }

    await this.em.flush();

    setTimeout(() => this.eventEmitter.emit(WebsocketEventsEnum.CG_EM_END), time);

    this.logger.log(`Bets are now registered and the current 'crash game' is now in progress`);

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public async handleEndCurrentGame(): Promise<CurrentCrashGameDTO> {
    if (!this.currentCrashGame) throw new Error("Crash game should be defined");

    this.currentCrashGame.state = CrashGameStateEnum.FINISHED;

    for (const bet of this.currentCrashGame.bets.filter(
      (bet) => bet.state === CrashGameBetStateEnum.PENDING
    )) {
      bet.state = CrashGameBetStateEnum.CRASHED;
    }

    await this.em.flush();

    const crashTick = CrashGameHelper.getCrashTickFromSeed(this.currentCrashGame.seed);
    const time = CrashGameHelper.getTimeFromCrashTick(crashTick);

    this.logger.log(
      `The current 'crash game' is now finished, crashed at x${crashTick / 100}, lasted for ${time}ms`
    );

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }
}
