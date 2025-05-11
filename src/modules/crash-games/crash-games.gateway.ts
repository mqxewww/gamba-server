import { UseFilters } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AppEvents } from "~common/enums/app-events.enum";
import { WsMessages } from "~common/enums/ws-messages.enum";
import { WsNamespaces } from "~common/enums/ws-namespaces.enum";
import { WsExceptionFilter } from "~common/filters/ws-exception.filter";
import { WsHelper } from "~common/helpers/ws.helper";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";
import { HandleAddBetDTO } from "~modules/crash-games/dto/inbound/handle-add-bet.dto";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: WsNamespaces.CRASH_GAMES })
export class CrashGamesGateway implements OnGatewayConnection {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket): Promise<void> {
    const response = await this.crashGamesService.handleConnection(client);

    client.emit(WsMessages.GAME_DATA, response);
  }

  @SubscribeMessage(WsMessages.ADD_BET)
  public async handleAddBet(client: Socket, message: string): Promise<void> {
    const response = await this.crashGamesService.handleAddBet(
      client,
      await WsHelper.parseAndValidateJSON(message, HandleAddBetDTO)
    );

    client.emit(WsMessages.ADD_BET_SUCCESS, true);

    this.server.emit(WsMessages.GAME_BET_UPDATE, response);
  }

  @SubscribeMessage(WsMessages.CASHOUT)
  public async handleCashout(client: Socket): Promise<void> {
    const response = await this.crashGamesService.handleCashout(client);

    client.emit(WsMessages.CASHOUT_SUCCESS, true);

    this.server.emit(WsMessages.GAME_BET_UPDATE, response);
  }

  @OnEvent(AppEvents.CRASH_GAME_CREATE)
  public async handleCreatePendingGame(): Promise<void> {
    const response = await this.crashGamesService.handleCreatePendingGame();

    this.server.emit(WsMessages.GAME_DATA, response);
  }

  @OnEvent(AppEvents.CRASH_GAME_START)
  public async handleRegisterBetsAndStart(payload: number): Promise<void> {
    await this.crashGamesService.handleRegisterBetsAndStart(payload);

    this.server.emit(WsMessages.GAME_STARTED, true);
  }

  @OnEvent(AppEvents.CRASH_GAME_END)
  public async handleEndCurrentGame(): Promise<void> {
    const response = await this.crashGamesService.handleEndCurrentGame();

    this.server.emit(WsMessages.GAME_ENDED, response);
  }
}
