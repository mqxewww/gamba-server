import { Game } from "~modules/games/entities/game.entity";
import { GameStateEnum } from "~modules/games/enums/game-state.enum";
import { UserDTO } from "~modules/users/dto/outbound/user.dto";

export class GameDTO {
  public constructor(
    public readonly uuid: string,
    public readonly state: GameStateEnum,
    public readonly users: UserDTO[]
  ) {}

  public static build(game: Game): GameDTO {
    return new GameDTO(
      game.uuid,
      game.state,
      game.users.getItems().map((user) => UserDTO.build(user))
    );
  }
}
