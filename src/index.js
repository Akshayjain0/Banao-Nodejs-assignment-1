import connectDb from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import cloudinary from "cloudinary";

dotenv.config({
	path: "/.env",
});

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
	api_key: process.env.CLOUDINARY_CLIENT_API,
	api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});
connectDb()
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log(`Server is running on port: ${process.env.PORT}`);
		});
	})
	.catch((error) => {
		console.error("MongoDb connection failed!!! ", error);
	});
