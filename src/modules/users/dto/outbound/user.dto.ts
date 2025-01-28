import { User } from "~modules/users/entities/user.entity";

export class UserDTO {
  public constructor(
    public readonly uuid: string,
    public readonly name: string,
    public readonly coins: number
  ) {}

  public static build(user: User): UserDTO {
    return new UserDTO(user.uuid, user.name, user.coins);
  }
}
