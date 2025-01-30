import { PendingBet } from "~modules/crash-games/dto/outbound/pending-bets.dto";

export type RegisterBetsAndStartType = {
  readonly bets: PendingBet[];
  readonly game_uuid: string;
};
