import { AppResponseError } from "~common/constants/app-error.constant";
import { WsErrorName } from "~common/constants/ws-error.constant";
import { UserDTO } from "~modules/users/dto/outbound/user.dto";

export type TokenValidationData = {
  userData?: UserDTO;
  error?: AppResponseError<WsErrorName>;
};
