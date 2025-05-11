import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WsException } from "@nestjs/websockets";
import moment from "moment";
import { DefaultEventsMap, Socket } from "socket.io";
import { WsError } from "~common/constants/ws-error.constant";
import { AppEvents } from "~common/enums/app-events.enum";
import { CrashGamesHelper } from "~common/helpers/crash-games.helper";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { BetDTO } from "~modules/crash-games/dto/outbound/bet.dto";
import { CrashGameAndBetsDTO } from "~modules/crash-games/dto/outbound/crash-game-and-bets.dto";
import { Bet } from "~modules/crash-games/entities/bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { BetStatus } from "~modules/crash-games/enums/bet-status.enum";
import { CrashGameState } from "~modules/crash-games/enums/crash-game-state.enum";
import { UserDTO } from "~modules/users/dto/outbound/user.dto";
import { User } from "~modules/users/entities/user.entity";
import { UsersService } from "~modules/users/users.service";

@Injectable()
export class CrashGamesService {
  private readonly logger = new Logger(CrashGamesService.name);
  private currentCrashGame: CrashGame | null = null;

  public constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly usersService: UsersService
  ) {}

  public async handleConnection(client: Socket): Promise<CrashGameAndBetsDTO> {
    await this.usersService.validateClient(client);

    return CrashGameAndBetsDTO.build(this.currentCrashGame);
  }

  public async handleAddBet(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user?: UserDTO }>,
    message: HandleAddBetDTO
  ): Promise<BetDTO> {
    if (!client.data.user) throw new WsException(WsError.NOT_LOGGED_IN);

    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameState.PENDING)
      throw new WsException(WsError.GAME_DOESNT_ALLOW);

    const user = await this.em.findOne(User, { uuid: client.data.user!.uuid });

    if (!user) {
      this.logger.warn(`[${this.handleAddBet.name}] Cannot find user ${client.data.user.uuid}`);

      throw new WsException(WsError.UNEXPECTED_ERROR);
    }

    if (this.currentCrashGame.bets.find((bet) => bet.user.uuid === user.uuid))
      throw new WsException(WsError.ALREADY_BET);

    if (message.amount > user.coins) throw new WsException(WsError.NOT_ENOUGH_COINS);

    const bet = this.em.create(Bet, {
      user,
      amount: message.amount,
      status: BetStatus.NOT_REGISTERED,
      crashGame: this.currentCrashGame
    });

    await this.em.flush();

    this.logger.log(`${user.name} has bet ${message.amount} coins`);

    return BetDTO.build(bet);
  }

  public async handleCashout(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user?: UserDTO }>
  ): Promise<BetDTO> {
    if (!client.data.user) throw new WsException(WsError.NOT_LOGGED_IN);

    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameState.IN_PROGRESS)
      throw new WsException(WsError.GAME_DOESNT_ALLOW);

    const userBet = this.currentCrashGame.bets.find(
      (bet) => bet.user.uuid === client.data.user!.uuid
    );

    if (!userBet) throw new WsException(WsError.NO_PENDING_BET);

    if (userBet.status !== BetStatus.PENDING) throw new WsException(WsError.ALREADY_CASHED_OUT);

    userBet.status = BetStatus.CASHED_OUT;

    await this.em.flush();

    userBet.cashedOutAt = CrashGamesHelper.getCrashTickFromTime(
      new Date().getTime() - (this.currentCrashGame.created_at.getTime() + 20000)
    );

    userBet.user.coins += userBet.amount * (userBet.cashedOutAt / 100);

    await this.em.flush();

    this.logger.log(
      `${userBet.user.name} cashed out at x${userBet.cashedOutAt / 100}, winning ${userBet.amount * (userBet.cashedOutAt / 100)} coins`
    );

    return BetDTO.build(userBet);
  }

  public async handleCreatePendingGame(): Promise<CrashGameAndBetsDTO> {
    const crashGame = this.em.create(CrashGame, {
      seed: CrashGamesHelper.generateRandomSeed(),
      state: CrashGameState.PENDING
    });

    this.currentCrashGame = crashGame;

    await this.em.flush();

    const crashTick = CrashGamesHelper.getCrashTickFromSeed(this.currentCrashGame.seed);
    const time = CrashGamesHelper.getTimeFromCrashTick(crashTick);

    setTimeout(
      () => this.eventEmitter.emit(AppEvents.CRASH_GAME_START, time),
      20000 - moment().milliseconds()
    );

    this.logger.log(`A new 'crash game' has been created`);

    return CrashGameAndBetsDTO.build(this.currentCrashGame);
  }

  public async handleRegisterBetsAndStart(time: number): Promise<void> {
    if (!this.currentCrashGame)
      throw new InternalServerErrorException(
        "Unable to register bets or start the game if no game has been created"
      );

    this.currentCrashGame.state = CrashGameState.IN_PROGRESS;

    for (const bet of this.currentCrashGame.bets) {
      bet.status = BetStatus.PENDING;
      bet.user.coins -= bet.amount;
    }

    await this.em.flush();

    setTimeout(() => this.eventEmitter.emit(AppEvents.CRASH_GAME_END), time);

    this.logger.log(`Bets are now registered and the current crash game is now in progress`);
  }

  public async handleEndCurrentGame(): Promise<number> {
    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameState.IN_PROGRESS)
      throw new InternalServerErrorException(
        "Unable to end the game if no game has been created or if it is not in progress"
      );

    this.currentCrashGame.state = CrashGameState.FINISHED;

    for (const bet of this.currentCrashGame.bets.filter(
      (bet) => bet.status === BetStatus.PENDING
    )) {
      bet.status = BetStatus.CRASHED;
    }

    await this.em.flush();

    const crashTick = CrashGamesHelper.getCrashTickFromSeed(this.currentCrashGame.seed);
    const time = CrashGamesHelper.getTimeFromCrashTick(crashTick);

    this.logger.log(
      `The current 'crash game' is now finished, crashed at x${crashTick / 100}, lasted for ${time}ms`
    );

    setTimeout(() => this.eventEmitter.emit(AppEvents.CRASH_GAME_CREATE), 5000);

    return crashTick;
  }
}
