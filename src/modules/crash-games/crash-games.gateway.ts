import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { WebsocketEventsEnum } from "~common/enums/ws-events.enum";
import { WebSocketHelper } from "~common/helpers/ws.helper";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { HandleCashoutDTO } from "~modules/crash-games/dto/inbound/handle-cashout.dto";

@WebSocketGateway({ namespace: "/crash-game" })
export class CrashGamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @WebSocketServer()
  namespace!: Namespace;

  public async handleConnection(client: Socket) {
    const response = await this.crashGamesService.handleConnection(this.namespace.server);

    client.emit(WebsocketEventsEnum.CG_DATA, response[0]);

    if (response[1]) client.broadcast.emit(WebsocketEventsEnum.CG_DATA, response[0]);
  }

  public handleDisconnect(client: Socket) {
    this.crashGamesService.handleDisconnect(client, this.namespace.server);
  }

  @SubscribeMessage(WebsocketEventsEnum.CG_ADD_BET)
  public async handleAddBet(client: Socket, message: string) {
    const response = await this.crashGamesService.handleAddBet(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO)
    );

    client.emit(WebsocketEventsEnum.CG_ADD_BET_REPLY, true);

    this.namespace.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }

  @SubscribeMessage(WebsocketEventsEnum.CG_CASHOUT)
  public async handleCashout(client: Socket, message: string) {
    const response = await this.crashGamesService.handleCashout(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleCashoutDTO)
    );

    client.emit(WebsocketEventsEnum.CG_CASHOUT_REPLY, true);

    this.namespace.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }
}
