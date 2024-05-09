import multer from "multer";
const storage = multer.memoryStorage();
const uploadPostImage = multer({ storage }).single("file")

export default uploadPostImage;