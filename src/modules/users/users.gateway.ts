import { UseFilters } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { HandleClientConnectedDTO } from "~common/dto/inbound/handle-client-connected.dto";
import { WsMessages } from "~common/enums/ws-messages.enum";
import { WsNamespaces } from "~common/enums/ws-namespaces.enum";
import { WsExceptionFilter } from "~common/filters/ws-exception.filter";
import { WsHelper } from "~common/helpers/ws.helper";
import { UsersService } from "~modules/users/users.service";

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: WsNamespaces.USERS })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public handleConnection() {
    this.usersService.handleConnection();
  }

  public handleDisconnect(client: Socket) {
    this.usersService.handleDisconnect(client);

    this.server.emit(WsMessages.USERS_LIST, this.usersService.getUsersList());
  }

  @SubscribeMessage(WsMessages.USER_CLIENT_CONNECTED)
  public async handleUserClientConnected(client: Socket, message: string): Promise<void> {
    const { instance, error } = await WsHelper.parseAndValidateJSON(
      message,
      HandleClientConnectedDTO
    );

    if (instance) {
      const response = await this.usersService.handleUserClientConnected(client, instance);

      if (response?.userData) client.emit(WsMessages.USER_DATA, response.userData);

      if (response?.error) client.emit(WsMessages.ERROR, response.error);
    }

    if (error) client.emit(WsMessages.ERROR, error);

    this.server.emit(WsMessages.USERS_LIST, this.usersService.getUsersList());
  }
}
