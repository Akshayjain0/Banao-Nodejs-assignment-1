import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		resetPasswordToken: {
			type: String,
		},
		resetPasswordExpire: {
			type: Date,
		},
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
});
userSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
	
};
userSchema.methods.getResetToken = async function () {
	const resetToken = crypto.randomBytes(20).toString("hex");
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
	await this.save();
	return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
