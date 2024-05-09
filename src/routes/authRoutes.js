import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post('/forgotpassword', forgotPassword)
authRouter.put('/resetpassword/:token', resetPassword)

export { authRouter };
