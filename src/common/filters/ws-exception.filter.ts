import { ArgumentsHost, Catch, WsExceptionFilter as ModuleWsExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { WsMessages } from "~common/enums/ws-messages.enum";

@Catch(WsException)
export class WsExceptionFilter implements ModuleWsExceptionFilter {
  public catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient() as Socket;
    const event = host.switchToWs().getPattern();

    let emitEvent = WsMessages.ERROR;

    switch (event) {
      case WsMessages.ADD_BET:
        emitEvent = WsMessages.ADD_BET_ERROR;
        break;
      case WsMessages.CASHOUT:
        emitEvent = WsMessages.CASHOUT_ERROR;
        break;
    }

    client.emit(emitEvent, exception.getError());
  }
}
