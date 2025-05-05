export enum WsMessages {
  // 'crash-game' related messages

  /** Used to send complete data for the current game. */
  GAME_DATA = "server/game_data",
  /** Used to communicate that the game has started. */
  GAME_STARTED = "server/game_started",
  /** Used to communicate that the game has ended. */
  GAME_ENDED = "server/game_ended",
  /** Used to send the complete data of a recently updated bet.  */
  GAME_BET_UPDATE = "server/game_bet_update",
  /** Used by the client to add a bet. */
  ADD_BET = "client/add_bet",
  /** Used to communicate that the bet is now pending. */
  ADD_BET_SUCCESS = "server/add_bet_success",
  /** Used to communicate that the bet couldn't be validated. */
  ADD_BET_ERROR = "server/add_bet_error",
  /** Used by the client to cashout his bet. */
  CASHOUT = "client/cashout",
  /** Used to communicate that the cashout has been completed. */
  CASHOUT_SUCCESS = "server/cashout_success",
  /** Used to communicate that the cashout couldn't be completed. */
  CASHOUT_ERROR = "server/cashout_error",

  // 'users' related messages

  /** Used to send the complete data of the logged-in user. */
  USER_DATA = "server/user_data",
  /** Used to send the number of connected players and the number of spectators. */
  USERS_LIST = "server/users_list",

  // other messages

  /** Used as default message on error, shouldn't be used. */
  ERROR = "server/error"
}
