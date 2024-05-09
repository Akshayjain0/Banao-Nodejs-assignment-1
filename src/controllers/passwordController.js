import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			res.status(400).json({
				success: false,
				message: "User not found",
			});
		}

		const resetToken = await user.getResetToken();
		console.log(resetToken);
		const url = `${process.env.RESET_PASSWORD_URL}/resetpassword/${resetToken}`;
		const message = `Copy the link and paste it on the postman to reset your password. ${url}`;
		await sendEmail(user.email, "Reset Password", message);

		return res.status(200).json({
			success: true,
			message: `Reset token has been sent to ${user.email}`,
		});
	} catch (error) {
		console.log(`Something went wrong in forgot password !!! ${error}`);
	}
};

const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;
		console.log(password);
		const resetPasswordToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire: { $gt: Date.now() },
		});

		if (!user) {
			res.status(401).json({
				success: false,
				message: "Token is invalid or has been expired",
			});
		}

		user.password = password;

		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save();

		return res.status(200).json({
			success: true,
			message: "Password has been successfully updated",
		});
	} catch (error) {
		console.log(`Something went wrong in reset password !!! ${error}`);
	}
};

export { forgotPassword, resetPassword };
