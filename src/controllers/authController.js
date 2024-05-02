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

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		const token = jwt.sign({ id: user._id, email }, process.env.SECRET, {
			expiresIn: "2h",
		});

		user.token = token;

		return res.status(201).json({
			id: user._id,
			username,
			email,
			token,
		});
	} catch (error) {
		console.log(error);
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
		const user = await User.findOne({ email });
		if (!user) {
			res.status(404).json({
				message: "Wrong credentials...",
			});
		}

		const matchedPassword = await bcrypt.compare(password, user.password);
		if (matchedPassword) {
			const token = jwt.sign(
				{ id: user._id, email },
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
				id: user._id,
				email,
				token,
			});
		}
		else {
			res.status(400).json({
				success: false,
				message: "Email & Password is invalid"
			})
		}
	} catch (error) {
		console.log(error);
	}
};


export { registerUser, loginUser };
