export class UserHelper {
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
