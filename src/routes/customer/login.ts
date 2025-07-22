import { getFromCache, saveToCache } from "@/redis/storage";
import { sendSMS } from "@/twilio";
import { RequestHandler } from "express";
import z from "zod";

export const loginHandlerBodySchema = z.object({
  phoneNumber: z.string().trim().nonempty("Phone number is required"),
  name: z.string().trim().nonempty("Name is required"),
});

export const loginHandler: RequestHandler<
  {},
  { status: string },
  z.infer<typeof loginHandlerBodySchema>
> = async (req, res) => {
  const { phoneNumber, name } = req.body;
  //   await deleteFromCache(`customer-login:${phoneNumber}`);

  const currentCache = await getFromCache(`customer-login:${phoneNumber}`);
  if (currentCache) {
    res.json({
      status: "already-sent",
    });
    return;
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  await sendSMS({
    to: phoneNumber,
    body: `Login to your RestoEase account\n\nYour verification code: ${verificationCode}\n\nThis code is valid for 5 minutes. Do not share it with anyone.`,
    whatsapp: true,
  });

  await saveToCache(
    `customer-login:${phoneNumber}`,
    {
      code: verificationCode,
      name,
    },
    5 * 60
  );

  res.json({
    status: "sent",
  });
};
