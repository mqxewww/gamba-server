export interface WsResponseError {
  name: WsErrorName;
  message: string;
}

export enum WsErrorName {
  TOKEN_DOESNT_EXISTS = "TOKEN_DOESNT_EXISTS",
  TOKEN_HAS_EXPIRED = "TOKEN_HAS_EXPIRED",
  INVALID_TOKEN_EMAIL = "INVALID_TOKEN_EMAIL",

  GAME_DOESNT_ALLOW = "GAME_DOESNT_ALLOW",
  ALREADY_BET = "ALREADY_BET",
  NOT_ENOUGH_COINS = "NOT_ENOUGH_COINS",
  NO_PENDING_BET = "NO_PENDING_BET",
  ALREADY_CASHED_OUT = "ALREADY_CASHED_OUT",

  NOT_LOGGED_IN = "NOT_LOGGED_IN",

  UNEXPECTED_ERROR = "UNEXPECTED_ERROR"
}

export const WsError: { [key in WsErrorName]: WsResponseError } = {
  [WsErrorName.TOKEN_DOESNT_EXISTS]: {
    name: WsErrorName.TOKEN_DOESNT_EXISTS,
    message: "The provided token does not exist."
  },
  [WsErrorName.TOKEN_HAS_EXPIRED]: {
    name: WsErrorName.TOKEN_HAS_EXPIRED,
    message: "The provided token has expired."
  },
  [WsErrorName.INVALID_TOKEN_EMAIL]: {
    name: WsErrorName.INVALID_TOKEN_EMAIL,
    message: "The provided email linked with the token is invalid."
  },

  [WsErrorName.GAME_DOESNT_ALLOW]: {
    name: WsErrorName.GAME_DOESNT_ALLOW,
    message: "The current status of the game does not allow you to perform this action."
  },
  [WsErrorName.ALREADY_BET]: {
    name: WsErrorName.ALREADY_BET,
    message: "You already have a bet."
  },
  [WsErrorName.NOT_ENOUGH_COINS]: {
    name: WsErrorName.NOT_ENOUGH_COINS,
    message: "You dont have enough coins."
  },
  [WsErrorName.NO_PENDING_BET]: {
    name: WsErrorName.NO_PENDING_BET,
    message: "You don't have any pending bet."
  },
  [WsErrorName.ALREADY_CASHED_OUT]: {
    name: WsErrorName.ALREADY_CASHED_OUT,
    message: "You have already cashed out your bet."
  },

  [WsErrorName.NOT_LOGGED_IN]: {
    name: WsErrorName.NOT_LOGGED_IN,
    message: "You are not logged in, please log in to bet."
  },

  [WsErrorName.UNEXPECTED_ERROR]: {
    name: WsErrorName.UNEXPECTED_ERROR,
    message: "An unexpected error has occured, please try again later."
  }
};
