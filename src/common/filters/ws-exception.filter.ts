import {
  Catch,
  type ArgumentsHost,
  type WsExceptionFilter as ModuleWsExceptionFilter
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { WsMessageEnum } from "~common/enums/ws-message.enum";

@Catch(WsException)
export class WsExceptionFilter implements ModuleWsExceptionFilter {
  public catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient() as Socket;
    const event = host.switchToWs().getPattern();

    let emitEvent: WsMessageEnum = WsMessageEnum.ERROR;

    switch (event) {
      case WsMessageEnum.ADD_BET:
        emitEvent = WsMessageEnum.ADD_BET_ERROR;
        break;
      case WsMessageEnum.CASHOUT:
        emitEvent = WsMessageEnum.CASHOUT_ERROR;
        break;
    }

    client.emit(emitEvent, exception.getError());
  }
}
