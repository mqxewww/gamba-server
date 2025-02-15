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
import { HandleCashoutDTO } from "~modules/crash-games/dto/inbound/handle-cashout.dto";

@WebSocketGateway()
export class CrashGamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket) {
    const response = await this.crashGamesService.handleConnection(client, this.server);

    client.emit("crash-game/data", response[0]);

    if (response[1]) client.broadcast.emit("crash-game/data", response[0]);
  }

  public handleDisconnect(client: Socket) {
    this.crashGamesService.handleDisconnect(client, this.server);
  }

  @SubscribeMessage("crash-game/add-bet")
  public async handleAddBet(client: Socket, message: string) {
    const response = await this.crashGamesService.handleAddBet(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO)
    );

    client.emit("crash-game/add-bet-reply", true);

    this.server.emit("crash-game/data", response);
  }

  @SubscribeMessage("crash-game/cashout")
  public async handleCashout(client: Socket, message: string) {
    const response = await this.crashGamesService.handleCashout(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleCashoutDTO)
    );

    client.emit("crash-game/handle-cashout-reply", true);

    this.server.emit("crash-game/data", response);
  }
}
