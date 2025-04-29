import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WsException } from "@nestjs/websockets";
import moment from "moment";
import { Socket, type DefaultEventsMap } from "socket.io";
import { WsError } from "~common/constants/ws-errors.constant";
import { EventEnum } from "~common/enums/event.enum";
import { CrashGameHelper } from "~common/helpers/crash-game.helper";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { CrashGameBetMinifiedDTO } from "~modules/crash-games/dto/outbound/crash-game-bet.dto";
import { CurrentCrashGameDTO } from "~modules/crash-games/dto/outbound/current-crash-game.dto";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";
import type { UserDTO } from "~modules/users/dto/outbound/user.dto";
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

  public async handleConnection(client: Socket): Promise<CurrentCrashGameDTO> {
    await this.usersService.validateClient(client);

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public async handleAddBet(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user?: UserDTO }>,
    message: HandleAddBetDTO
  ): Promise<CrashGameBetMinifiedDTO> {
    if (!client.data.user) throw new WsException(WsError.NOT_LOGGED_IN);

    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.PENDING)
      throw new WsException(WsError.GAME_DOESNT_ALLOW);

    const user = await this.em.findOne(User, { uuid: client.data.user!.uuid });

    if (!user) {
      this.logger.error(`[handleAddBet] Cannot find user ${client.data.user.uuid}`);

      throw new WsException(WsError.UNEXPECTED_ERROR);
    }

    if (this.currentCrashGame.bets.find((bet) => bet.user.uuid === user.uuid))
      throw new WsException(WsError.ALREADY_BET);

    if (message.amount > user.coins) throw new WsException(WsError.NOT_ENOUGH_COINS);

    const bet = this.em.create(CrashGameBet, {
      user,
      amount: message.amount,
      state: CrashGameBetStateEnum.NOT_REGISTERED,
      crashGame: this.currentCrashGame
    });

    await this.em.flush();

    this.logger.log(`${user.name} has bet ${message.amount} coins`);

    return CrashGameBetMinifiedDTO.build(bet);
  }

  public async handleCashout(
    client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user?: UserDTO }>
  ): Promise<CrashGameBetMinifiedDTO> {
    if (!client.data.user) throw new WsException(WsError.NOT_LOGGED_IN);

    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.IN_PROGRESS)
      throw new WsException(WsError.GAME_DOESNT_ALLOW);

    const userBet = this.currentCrashGame.bets.find(
      (bet) => bet.user.uuid === client.data.user!.uuid
    );

    if (!userBet) throw new WsException(WsError.NO_PENDING_BET);

    if (userBet.state !== CrashGameBetStateEnum.PENDING)
      throw new WsException(WsError.ALREADY_CASHED_OUT);

    userBet.state = CrashGameBetStateEnum.CASHED_OUT;

    await this.em.flush();

    userBet.cashedOutAt = CrashGameHelper.getCrashTickFromTime(
      new Date().getTime() - (this.currentCrashGame.created_at.getTime() + 20000)
    );

    userBet.user.coins += userBet.amount * (userBet.cashedOutAt / 100);

    await this.em.flush();

    this.logger.log(
      `${userBet.user.name} cashed out at x${userBet.cashedOutAt / 100}, winning ${userBet.amount * (userBet.cashedOutAt / 100)} coins`
    );

    return CrashGameBetMinifiedDTO.build(userBet);
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
      () => this.eventEmitter.emit(EventEnum.CRASH_GAME_START, time),
      20000 - moment().milliseconds()
    );

    this.logger.log(`A new 'crash game' has been created`);

    return CurrentCrashGameDTO.build(this.currentCrashGame);
  }

  public async handleRegisterBetsAndStart(time: number): Promise<void> {
    if (!this.currentCrashGame)
      throw new InternalServerErrorException(
        "Unable to register bets or start the game if no game has been created"
      );

    this.currentCrashGame.state = CrashGameStateEnum.IN_PROGRESS;

    for (const bet of this.currentCrashGame.bets) {
      bet.state = CrashGameBetStateEnum.PENDING;
      bet.user.coins -= bet.amount;
    }

    await this.em.flush();

    setTimeout(() => this.eventEmitter.emit(EventEnum.CRASH_GAME_END), time);

    this.logger.log(`Bets are now registered and the current 'crash game' is now in progress`);
  }

  public async handleEndCurrentGame(): Promise<number> {
    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.IN_PROGRESS)
      throw new InternalServerErrorException(
        "Unable to end the game if no game has been created or if it is not in progress."
      );

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

    setTimeout(() => this.eventEmitter.emit(EventEnum.CRASH_GAME_CREATE), 5000);

    return crashTick;
  }
}
