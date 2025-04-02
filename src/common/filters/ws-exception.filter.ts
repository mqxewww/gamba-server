import {
  Catch,
  type ArgumentsHost,
  type WsExceptionFilter as ModuleWsExceptionFilter
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { WebSocketHelper } from "~common/helpers/ws.helper";

@Catch(WsException)
export class WsExceptionFilter implements ModuleWsExceptionFilter {
  public catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient() as Socket;
    const event = host.switchToWs().getPattern();

    client.emit(
      `${event}-response`,
      WebSocketHelper.createWsResponse(false, undefined, exception.getError())
    );
  }
}
