import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, message) => {
	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	await transporter.sendMail({
		to,
		subject,
		text: message,
	});
};
