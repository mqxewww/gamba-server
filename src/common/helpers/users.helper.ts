export class UsersHelper {
  /**
   * Generates an username from the provided email.
   *
   * If the username is already taken, an integer is added at the end until an available username is found.
   *
   * @param email The email from which to generate the username.
   * @param verifier A function that checks if an username is available.
   *
   * @returns A unique username based on the email provided.
   */
  public static async formatUsername(
    email: string,
    verifier: (username: string) => Promise<boolean>
  ): Promise<string> {
    let username: string;
    let i = 0;

    do {
      username =
        i === 0
          ? email.split("@")[0].toLowerCase().replace(" ", "")
          : `${email.split("@")[0]}${i}`.toLowerCase().replace(" ", "");

      i++;
    } while (!(await verifier(username)));

    return username;
  }
}
