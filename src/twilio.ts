import twilio from "twilio";
import { Config } from "./config";
import { Logger } from "./lib/logger";

export const sendSMS = async (cfg: { to: string; body: string; whatsapp?: boolean }) => {
  const client = twilio(Config.TWILIO_ACCOUNT_SID(), Config.TWILIO_AUTH_TOKEN());

  Logger.log(
    "TWILIO",
    `sendSMS(to=${cfg.to}, body=${cfg.body.replaceAll("\n", "_")}, whatsapp=${cfg.whatsapp})`
  );

  const { to, body, whatsapp = false } = cfg;
  try {
    const message = await client.messages.create({
      body,
      from: whatsapp ? `whatsapp:${Config.TWILIO_PHONE_NUMBER()}` : Config.TWILIO_PHONE_NUMBER(),
      to: whatsapp ? `whatsapp:${to}` : to,
    });
    return message;
  } catch (error) {
    Logger.log(
      "TWILIO",
      `FAILED: sendSMS(to=${cfg.to}, body=${cfg.body}, whatsapp=${cfg.whatsapp}) ->`,
      error
    );
    throw new Error("Failed to send message");
  }
};
