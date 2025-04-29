import { UseFilters } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { EventEnum } from "~common/enums/event.enum";
import { WsMessageEnum } from "~common/enums/ws-message.enum";
import { WsNamespaceEnum } from "~common/enums/ws-namespace.enum";
import { WsExceptionFilter } from "~common/filters/ws-exception.filter";
import { WebSocketHelper } from "~common/helpers/ws.helper";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: WsNamespaceEnum.CRASH_GAMES })
export class CrashGamesGateway implements OnGatewayConnection {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket, ..._args: unknown[]): Promise<void> {
    const response = await this.crashGamesService.handleConnection(client);

    client.emit(WsMessageEnum.CG_DATA, response);
  }

  @SubscribeMessage(WsMessageEnum.CG_ADD_BET)
  public async handleAddBet(client: Socket, message: string): Promise<void> {
    const response = await this.crashGamesService.handleAddBet(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO)
    );

    client.emit(WsMessageEnum.CG_ADD_BET_RES, true);

    this.server.emit(WsMessageEnum.CG_DATA, response);
  }

  @SubscribeMessage(WsMessageEnum.CG_CASHOUT)
  public async handleCashout(client: Socket): Promise<void> {
    const response = await this.crashGamesService.handleCashout(client);

    client.emit(WsMessageEnum.CG_CASHOUT_RES, true);

    this.server.emit(WsMessageEnum.CG_DATA, response);
  }

  @OnEvent(EventEnum.CG_CREATE)
  public async handleCreatePendingGame(): Promise<void> {
    const response = await this.crashGamesService.handleCreatePendingGame();

    this.server.emit(WsMessageEnum.CG_DATA, response);
  }

  @OnEvent(EventEnum.CG_START)
  public async handleRegisterBetsAndStart(payload: number): Promise<void> {
    const response = await this.crashGamesService.handleRegisterBetsAndStart(payload);

    this.server.emit(WsMessageEnum.CG_DATA, response);
  }

  @OnEvent(EventEnum.CG_END)
  public async handleEndCurrentGame(): Promise<void> {
    const response = await this.crashGamesService.handleEndCurrentGame();

    this.server.emit(WsMessageEnum.CG_DATA, response);
  }
}
