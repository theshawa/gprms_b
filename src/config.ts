export class Config {
  static INITIAL_ADMIN_PASSWORD(): string {
    return process.env.INITIAL_ADMIN_PASSWORD || "iambatman";
  }

  static REFRESH_TOKEN_SECRET(): string {
    return process.env.REFRESH_TOKEN_SECRET || "supermaniscool";
  }

  static ACCESS_TOKEN_SECRET(): string {
    return process.env.ACCESS_TOKEN_SECRET || "hulksmash";
  }

  static ACCESS_TOKEN_EXPIRY(): string {
    return "1h";
  }

  static REFRESH_TOKEN_EXPIRY(): string {
    return "7d";
  }

  static CLOUDINARY_CLOUD_NAME(): string {
    return process.env.CLOUDINARY_CLOUD_NAME || "";
  }

  static CLOUDINARY_API_KEY(): string {
    return process.env.CLOUDINARY_API_KEY || "";
  }

  static CLOUDINARY_API_SECRET(): string {
    return process.env.CLOUDINARY_API_SECRET || "";
  }

  static TWILIO_ACCOUNT_SID(): string {
    return process.env.TWILIO_ACCOUNT_SID || "";
  }

  static TWILIO_AUTH_TOKEN(): string {
    return process.env.TWILIO_AUTH_TOKEN || "";
  }

  static TWILIO_PHONE_NUMBER(): string {
    return process.env.TWILIO_PHONE_NUMBER || "";
  }
}
