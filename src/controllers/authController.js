import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!(username && email && password)) {
			res.status(400).json({
				message: "username, email and password is required!!!",
			});
		}

		const userExists = await User.findOne({ email });

		if (userExists) {
			res.status(401).json({
				message: "User already exists with this email.",
			});
		}

		const user = await User.create({
			username,
			email,
			password,
		});

		const token = jwt.sign({ _id: user._id, email }, process.env.SECRET, {
			expiresIn: "2h",
		});

		user.token = token;

		const options = {
			expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			httpOnly: true,
		};
		return res.status(201).cookie("token", token, options).json({
			user,
			token,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!(email && password)) {
			res.status(400).json({
				message: "All fields is required!!",
			});
		}
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			res.status(404).json({
				message: "Wrong credentials...",
			});
		}

		const matchedPassword = await user.matchPassword(password);
		if (matchedPassword) {
			const token = jwt.sign(
				{ _id: user._id, email },
				process.env.SECRET,
				{
					expiresIn: "2h",
				}
			);

			user.token = token;

			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			return res.status(200).cookie("token", token, options).json({
				success: true,
				user,
				token,
			});
		} else {
			res.status(400).json({
				success: false,
				message: "Email & Password is invalid",
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
const logout = (req, res) => {
	res.clearCookie("token")
		.status(200)
		.json({ success: true, message: "Logged Out!!!" });
};

export { registerUser, loginUser, logout };
