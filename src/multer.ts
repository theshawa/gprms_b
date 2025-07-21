import multer, { diskStorage } from "multer";
import { v4 } from "uuid";

const storage = diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + v4() + "." + ext);
  },
});

export const multerFileUpload = multer({
  storage,
});
