import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { Config } from "./config";

cloudinary.config({
  cloud_name: Config.CLOUDINARY_CLOUD_NAME,
  api_key: Config.CLOUDINARY_API_KEY,
  api_secret: Config.CLOUDINARY_API_SECRET,
});

export const uploadAssetToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  name: string = "",
  dontDelete = false
) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    use_filename: !!name,
    public_id: name || undefined,
    unique_filename: !name,
    resource_type: "auto",
    access_mode: "public",
    overwrite: true,
    invalidate: true,
  });

  if (!dontDelete) {
    fs.unlink(file.path, (err: any) => {
      if (err) {
        console.error("Failed to delete local file:", err);
      }
    });
  }

  return result;
};

export const deleteAssetFromCloudinary = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};

export const getAssetUrl = (publicId: string) => {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: "auto",
  });
};
