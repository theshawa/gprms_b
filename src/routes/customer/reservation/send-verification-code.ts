import { getFromCache, saveToCache } from "@/redis/storage";
import { sendSMS } from "@/twilio";
import { RequestHandler } from "express";
import z from "zod";

export const sendVerificationCodeSchema = z.object({
  phoneNumber: z.string().trim().nonempty("Phone number is required"),
});

export const sendVerificationCodeHandler: RequestHandler<
  {},
  { status: string },
  z.infer<typeof sendVerificationCodeSchema>
> = async (req, res) => {
  const { phoneNumber } = req.body;

  const currentCache = await getFromCache(`customer-reservation-verification:${phoneNumber}`);
  if (currentCache) {
    res.json({
      status: "already-sent",
    });
    return;
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  await sendSMS({
    to: phoneNumber,
    body: `Verify your phone number for RestoEase.\n\nYour verification code: ${verificationCode}\n\nThis code is valid for 5 minutes. Do not share it with anyone.`,
    whatsapp: true,
  });

  await saveToCache(
    `customer-reservation-verification:${phoneNumber}`,
    {
      code: verificationCode,
    },
    5 * 60
  );

  res.json({
    status: "sent",
  });
};
