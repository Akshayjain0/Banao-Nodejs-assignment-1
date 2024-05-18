import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
	try {
		const { token } = req.cookies;

		if (!token) {
			res.status(401).json({
				message: "Please login first!!",
			});
		}
		const decoded = jwt.verify(token, process.env.SECRET);

		req.user = await User.findById(decoded._id);
		// console.log(req.user)

		next();
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			stack: error.stack,
		});
	}
};
export default isAuthenticated;
