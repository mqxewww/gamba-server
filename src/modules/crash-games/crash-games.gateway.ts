import { OnEvent } from "@nestjs/event-emitter";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebsocketEventsEnum } from "~common/enums/ws-events.enum";
import { WebSocketHelper } from "~common/helpers/ws.helper";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";
import { HandleCashoutDTO } from "~modules/crash-games/dto/inbound/handle-cashout.dto";

@WebSocketGateway({ namespace: "crash-games" })
export class CrashGamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket, ..._args: unknown[]): Promise<void> {
    const response = await this.crashGamesService.handleConnection(client);

    client.emit(WebsocketEventsEnum.CG_DATA, response);
  }

  public handleDisconnect(client: Socket): void {
    this.crashGamesService.handleDisconnect(client);
  }

  @SubscribeMessage(WebsocketEventsEnum.CG_ADD_BET)
  public async handleAddBet(client: Socket, message: string): Promise<void> {
    const response = await this.crashGamesService.handleAddBet(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO)
    );

    client.emit(WebsocketEventsEnum.CG_ADD_BET_REPLY, true);

    this.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }

  @SubscribeMessage(WebsocketEventsEnum.CG_CASHOUT)
  public async handleCashout(client: Socket, message: string): Promise<void> {
    const response = await this.crashGamesService.handleCashout(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleCashoutDTO)
    );

    client.emit(WebsocketEventsEnum.CG_CASHOUT_REPLY, true);

    this.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }

  @OnEvent(WebsocketEventsEnum.CG_EM_CREATE)
  public async handleCreatePendingGame(): Promise<void> {
    const response = await this.crashGamesService.handleCreatePendingGame();

    this.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }

  @OnEvent(WebsocketEventsEnum.CG_EM_START)
  public async handleRegisterBetsAndStart(payload: number): Promise<void> {
    const response = await this.crashGamesService.handleRegisterBetsAndStart(payload);

    this.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }

  @OnEvent(WebsocketEventsEnum.CG_EM_END)
  public async handleEndCurrentGame(): Promise<void> {
    const response = await this.crashGamesService.handleEndCurrentGame();

    this.server.emit(WebsocketEventsEnum.CG_DATA, response);
  }
}
