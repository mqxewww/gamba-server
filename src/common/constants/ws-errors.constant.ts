export interface WsResponseError {
  name: WsErrorName;
  message: string;
}

export enum WsErrorName {
  GAME_DOESNT_ALLOW = "GAME_DOESNT_ALLOW",
  ALREADY_BET = "ALREADY_BET",
  NOT_ENOUGH_COINS = "NOT_ENOUGH_COINS",
  NO_PENDING_BET = "NO_PENDING_BET",
  ALREADY_CASHED_OUT = "ALREADY_CASHED_OUT"
}

export const WsError: { [key in WsErrorName]: WsResponseError } = {
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
  }
};
