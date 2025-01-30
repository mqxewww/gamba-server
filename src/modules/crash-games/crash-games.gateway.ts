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
import {
  PendingBet,
  PendingBetMinifiedDTO
} from "~modules/crash-games/dto/outbound/pending-bets.dto";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
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
  public readonly pendingBets: PendingBet[] = [];
  public currentCrashGame: CrashGame | null = null;

  public async handleConnection(client: Socket) {
    console.log(`${client.id} joined, ${this.server.sockets.sockets.size} client(s) online !`);

    if (this.shouldCreateNewCrashGame()) {
      this.currentCrashGame = await this.crashGamesService.createPendingCrashGame();
      this.pendingBets.splice(0, this.pendingBets.length);

      console.log(`At least ${this.MIN_CLIENT} clients are connected, created a new game !`);
    } else {
      console.log(
        `Missing ${this.MIN_CLIENT - this.server.sockets.sockets.size} client(s) to create a game.`
      );
    }
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

    if (this.pendingBets.find((bet) => bet.user.uuid === user.uuid) || body.amount > user.coins) {
      client.emit("crash-game/add-bet-reply", false);
      return false;
    }

    this.pendingBets.push(new PendingBet(user, body.amount, body.auto_cashout));

    client.emit("crash-game/add-bet-reply", true);

    this.server.emit(
      "crash-game/ongoing-bets",
      this.pendingBets.map((pendingBet) => PendingBetMinifiedDTO.build(pendingBet))
    );
  }

  public shouldCreateNewCrashGame(): boolean {
    if (!this.currentCrashGame) {
      if (this.server.sockets.sockets.size >= this.MIN_CLIENT) return true;

      return false;
    }

    return this.currentCrashGame.state === CrashGameStateEnum.FINISHED;
  }
}
