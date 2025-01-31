import { EntityManager } from "@mikro-orm/mysql";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebSocketHelper } from "~common/helpers/ws.helper";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { CurrentCrashGameDTO } from "~modules/crash-games/dto/outbound/current-crash-game.dto";
import { CrashGameBet } from "~modules/crash-games/entities/crash-game-bet.entity";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameBetStateEnum } from "~modules/crash-games/enums/crash-game-bet-state.enum";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";
import { User } from "~modules/users/entities/user.entity";

@WebSocketGateway()
export class CrashGamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(
    private readonly crashGamesService: CrashGamesService,
    private readonly em: EntityManager
  ) {}

  @WebSocketServer()
  private readonly server!: Server;

  public readonly MIN_CLIENT = 3;
  public readonly bets: CrashGameBet[] = [];
  public currentCrashGame: CrashGame | null = null;

  public async handleConnection(client: Socket) {
    if (this.shouldCreateNewCrashGame()) {
      this.currentCrashGame = await this.crashGamesService.createPendingCrashGame();
      this.bets.splice(0, this.bets.length);
    }

    client.emit("crash-game/data", CurrentCrashGameDTO.build(this.currentCrashGame, this.bets));
  }

  public handleDisconnect(client: Socket) {
    console.log(`${client.id} left, ${this.server.sockets.sockets.size} client(s) online.`);
  }

  @SubscribeMessage("crash-game/add-bet")
  public async handleAddBet(client: Socket, message: string) {
    if (!this.currentCrashGame || this.currentCrashGame.state !== CrashGameStateEnum.PENDING) {
      client.emit("crash-game/add-bet-reply", false);
      return false;
    }

    const body = await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO);
    const user = await this.em.findOneOrFail(User, { uuid: body.user_uuid });

    if (this.bets.find((bet) => bet.user.uuid === user.uuid) || body.amount > user.coins) {
      client.emit("crash-game/add-bet-reply", false);
      return false;
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

    client.emit("crash-game/add-bet-reply", true);

    this.server.emit(
      "crash-game/data",
      CurrentCrashGameDTO.build(this.currentCrashGame, this.bets)
    );
  }

  public shouldCreateNewCrashGame(): boolean {
    if (!this.currentCrashGame) {
      if (this.server.sockets.sockets.size >= this.MIN_CLIENT) return true;

      return false;
    }

    return this.currentCrashGame.state === CrashGameStateEnum.FINISHED;
  }

  public async registerBetsAndStart(): Promise<void> {
    await this.em.persistAndFlush(this.bets);
  }
}
