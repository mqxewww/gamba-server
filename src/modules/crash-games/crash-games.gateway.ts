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

    client.emit(WsMessageEnum.GAME_DATA, response);
  }

  @SubscribeMessage(WsMessageEnum.ADD_BET)
  public async handleAddBet(client: Socket, message: string): Promise<void> {
    const response = await this.crashGamesService.handleAddBet(
      client,
      await WebSocketHelper.parseAndValidateJSON(message, HandleAddBetDTO)
    );

    client.emit(WsMessageEnum.ADD_BET_SUCCESS, true);

    this.server.emit(WsMessageEnum.GAME_BET_UPDATE, response);
  }

  @SubscribeMessage(WsMessageEnum.CASHOUT)
  public async handleCashout(client: Socket): Promise<void> {
    const response = await this.crashGamesService.handleCashout(client);

    client.emit(WsMessageEnum.CASHOUT_SUCCESS, true);

    this.server.emit(WsMessageEnum.GAME_BET_UPDATE, response);
  }

  @OnEvent(EventEnum.CRASH_GAME_CREATE)
  public async handleCreatePendingGame(): Promise<void> {
    const response = await this.crashGamesService.handleCreatePendingGame();

    this.server.emit(WsMessageEnum.GAME_DATA, response);
  }

  @OnEvent(EventEnum.CRASH_GAME_START)
  public async handleRegisterBetsAndStart(payload: number): Promise<void> {
    await this.crashGamesService.handleRegisterBetsAndStart(payload);

    this.server.emit(WsMessageEnum.GAME_STARTED, true);
  }

  @OnEvent(EventEnum.CRASH_GAME_END)
  public async handleEndCurrentGame(): Promise<void> {
    const response = await this.crashGamesService.handleEndCurrentGame();

    this.server.emit(WsMessageEnum.GAME_ENDED, response);
  }
}
