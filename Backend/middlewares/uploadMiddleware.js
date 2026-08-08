const multer = require("multer");
const AppError = require("../utils/appError");

// loc save image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },

  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${Date.now()}.${ext}`);
  },
});
//Images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only image files", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

exports.uploadUserPhoto = upload.single("photo");