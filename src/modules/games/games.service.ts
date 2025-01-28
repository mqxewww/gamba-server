import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { CreateGameDTO } from "~modules/games/dto/inbound/create-game.dto";
import { StartGameDTO } from "~modules/games/dto/inbound/start-game.dto";
import { GameDTO } from "~modules/games/dto/outbound/game.dto";
import { Game } from "~modules/games/entities/game.entity";
import { GameStateEnum } from "~modules/games/enums/game-state.enum";
import { UserTemplate } from "~modules/user-templates/entities/user-template.entity";
import { User } from "~modules/users/entities/user.entity";

@Injectable()
export class GamesService {
  public constructor(private readonly em: EntityManager) {}

  public async createGame(body: CreateGameDTO): Promise<GameDTO> {
    const game = this.em.create(Game, { state: GameStateEnum.PENDING });
    const host = this.em.create(User, {
      name: body.host_name,
      coins: 500,
      game
    });

    await this.em.persistAndFlush(host);

    return GameDTO.build(game);
  }

  public async startGame(body: StartGameDTO): Promise<boolean> {
    const game = await this.em.findOneOrFail(Game, { uuid: body.game_uuid });

    if (game.state !== GameStateEnum.PENDING) return false;

    const userTemplates = await this.em.find(
      UserTemplate,
      {},
      {
        limit: body.robots_count
      }
    );

    const robotUsers = userTemplates.map((userTemplate) =>
      this.em.create(User, { name: userTemplate.name, coins: 500, game: game })
    );

    await this.em.persistAndFlush(robotUsers);

    game.state = GameStateEnum.STARTED;

    await this.em.persistAndFlush(game);

    return true;
  }
}
