import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:token', resetPassword)

export { router };
