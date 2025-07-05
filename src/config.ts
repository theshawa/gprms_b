export class Config {
  static INITIAL_ADMIN_PASSWORD: string =
    process.env.INITIAL_ADMIN_PASSWORD || "iambatman";

  static REFRESH_TOKEN_SECRET: string =
    process.env.REFRESH_TOKEN_SECRET || "supermaniscool";

  static ACCESS_TOKEN_SECRET: string =
    process.env.ACCESS_TOKEN_SECRET || "hulksmash";

  static ACCESS_TOKEN_EXPIRY: string = "1h";

  static REFRESH_TOKEN_EXPIRY: string = "7d";
}
