export class UserHelper {
  /**
   * Generates an username from the provided email.
   *
   * If the name is already taken, an integer is added at the end until an available name is found.
   *
   * @param email The email from which to generate the username.
   * @param verifier A function that checks if a name is available.
   *
   * @returns A unique username based on the email provided.
   */
  public static async formatUserName(
    email: string,
    verifier: (name: string) => Promise<boolean>
  ): Promise<string> {
    let name: string;
    let i = 0;

    do {
      name =
        i === 0
          ? email.split("@")[0].toLowerCase().replace(" ", "")
          : `${email.split("@")[0]}${i}`.toLowerCase().replace(" ", "");

      i++;
    } while (!(await verifier(name)));

    return name;
  }
}
