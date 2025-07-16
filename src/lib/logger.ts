import fs from "fs";

export class Logger {
  private static readonly _logPath = "app.log";

  private static writeToFile(message: string) {
    fs.appendFileSync(Logger._logPath, message + "\n");
  }

  static log(service: string, ...data: any) {
    const message = `${new Date().toISOString()} [${service}] ${data.join(
      " "
    )}`;

    if (process.env.NODE_ENV === "production") {
      this.writeToFile(message);
    }
    console.log(message);
  }
}
