export class Config {
  static INITIAL_ADMIN_PASSWORD: string =
    process.env.INITIAL_ADMIN_PASSWORD || "iambatman";

  static REFRESH_TOKEN_SECRET: string =
    process.env.REFRESH_TOKEN_SECRET || "supermaniscool";

  static ACCESS_TOKEN_SECRET: string =
    process.env.ACCESS_TOKEN_SECRET || "hulksmash";

  static ACCESS_TOKEN_EXPIRY: string = "1h";

  static REFRESH_TOKEN_EXPIRY: string = "7d";

  static CLOUDINARY_CLOUD_NAME: string =
    process.env.CLOUDINARY_CLOUD_NAME || "";
  static CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || "";
  static CLOUDINARY_API_SECRET: string =
    process.env.CLOUDINARY_API_SECRET || "";
  static CLOUDINARY_URL: string = process.env.CLOUDINARY_URL || "";
}
