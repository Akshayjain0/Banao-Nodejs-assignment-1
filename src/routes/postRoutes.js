import express from "express";
import {
	addCommentAndUpdate,
	createPost,
	deleteComment,
	deletePost,
	likeAndDislikePost,
	updatePost,
} from "../controllers/postController.js";
import isAuthenticated from "../middleware/auth.js";
import uploadPostImage from "../middleware/multer.js";

const postRouter = express.Router();

postRouter
	.route("/post/upload")
	.post(uploadPostImage, isAuthenticated, createPost);
postRouter
	.route("/post/:id")
	.get(isAuthenticated, likeAndDislikePost)
	.put(isAuthenticated, updatePost)
	.delete(isAuthenticated, deletePost);

postRouter
	.route("/post/comment/:id")
	.put(isAuthenticated, addCommentAndUpdate)
	.delete(isAuthenticated, deleteComment);

export { postRouter };
