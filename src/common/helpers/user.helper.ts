export class UserHelper {
  public static async generateUserCode(verifier: (code: string) => Promise<boolean>) {
    let code = "";

    do {
      code = Math.random().toString().slice(2, 6);
    } while (!(await verifier(code)));

    return code;
  }
}
