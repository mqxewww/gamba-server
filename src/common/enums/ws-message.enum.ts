export enum WsMessageEnum {
  // 'crash-game' related messages
  GAME_DATA = "server/game_data",
  GAME_STARTED = "server/game_started",
  GAME_ENDED = "server/game_ended",
  GAME_BET_UPDATE = "server/game_bet_update",

  ADD_BET = "client/add_bet",
  ADD_BET_SUCCESS = "server/add_bet_success",
  ADD_BET_ERROR = "server/add_bet_error",

  CASHOUT = "client/cashout",
  CASHOUT_SUCCESS = "server/cashout_success",
  CASHOUT_ERROR = "server/cashout_error",

  // 'users' related messages
  USER_DATA = "server/user_data",
  USERS_LIST = "server/users_list",

  // other messages
  ERROR = "server/error"
}
