import twilio from "twilio";
import { Config } from "./config";

export const sendSMS = async (cfg: {
  to: string;
  body: string;
  whatsapp?: boolean;
}) => {
  const client = twilio(
    Config.TWILIO_ACCOUNT_SID(),
    Config.TWILIO_AUTH_TOKEN()
  );

  const { to, body, whatsapp = false } = cfg;
  try {
    const message = await client.messages.create({
      body,
      from: whatsapp
        ? `whatsapp:${Config.TWILIO_PHONE_NUMBER()}`
        : Config.TWILIO_PHONE_NUMBER(),
      to: whatsapp ? `whatsapp:${to}` : to,
    });
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};
