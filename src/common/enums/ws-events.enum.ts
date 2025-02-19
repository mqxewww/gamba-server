export enum WebsocketEventsEnum {
  CG_DATA = "crash-game/data",

  CG_ADD_BET = "crash-game/add-bet",
  CG_ADD_BET_REPLY = "crash-game/add-bet-reply",

  CG_CASHOUT = "crash-game/cashout",
  CG_CASHOUT_REPLY = "crash-game/cashout-reply",

  CG_EM_CREATE = "crash-game.create",
  CG_EM_START = "crash-game.start",
  CG_EM_END = "crash-game.end"
}
