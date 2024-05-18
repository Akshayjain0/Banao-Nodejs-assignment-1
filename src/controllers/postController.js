import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { decrypt, encrypt } from "../utils/encryptData.js";

const createPost = async (req, res) => {
	try {
		const file = req.file;
		// console.log(file)
		const fileUri = getDataUri(file);
		const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
		const { ivs, encryptedData } = encrypt(
			req.body.caption,
			myCloud.secure_url
		);

		const newPostData = {
			encryptedCaption: encryptedData.encryptedCaption,
			ivCaption: ivs.ivCaption,
			image: {
				public_id: myCloud.public_id,
				encryptedImgUrl: encryptedData.encryptedImgUrl,
				ivImgUrl: ivs.ivImgUrl,
			},
			owner: req.user._id,
		};
		const post = await Post.create(newPostData);

		const user = await User.findById(req.user._id);

		user.posts.push(post._id);

		await user.save();

		res.status(201).json({
			success: true,
			message: "Post create successfully",
			post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const getAllPost = async (req, res) => {
	try {
		const userId = req.user._id;
		const posts = await Post.find({ owner: userId });

		const decryptPostData = (post) => {
			const decryptedData = decrypt(
			  {
				encryptedCaption: post.encryptedCaption,
				encryptedImgUrl: post.image.encryptedImgUrl,
			  },
			  {
				ivCaption: post.ivCaption,
				ivImgUrl: post.image.ivImgUrl,
			  }
			);
			return {
				encryptedCaption: decryptedData.decryptedCaption,
				encryptedImgUrl: decryptedData.decryptedImgUrl,
			};
		  };

		const decryptedPosts = posts.map(decryptPostData);

		res.status(200).json({
			success: true,
			decryptedPosts,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			stack: error.stack,
		});
	}
};

const deletePost = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(401).json({
				success: false,
				message: "Post not found!",
			});
		}

		// console.log(postId);
		// console.log(req.user);
		if (post.owner.toString() !== req.user._id.toString()) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}
		await post.deleteOne();

		const user = await User.findById(req.user._id);
		const index = user.posts.indexOf(postId);
		user.posts.splice(index, 1);

		await user.save();
		res.status(201).json({
			success: true,
			message: "Post deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			stack: error.stack,
		});
	}
};

const updatePost = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(400).json({
				success: false,
				message: "Post not found",
			});
		}
		// console.log(req.user._id)
		if (post.owner.toString() !== req.user._id.toString()) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		post.encryptedCaption = req.body.caption;
		await post.save();
		res.status(201).json({
			success: true,
			message: "Post has been updated",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			stack: error.stack,
		});
	}
};

const addCommentAndUpdate = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);
		// console.log(post)
		if (!post) {
			return res.status(401).json({
				success: false,
				message: "Post not found",
			});
		}

		let commentIndex = -1;
		post.comments.forEach((item, index) => {
			if (item.user.toString() === req.user._id.toString()) {
				commentIndex = index;
			}
		});

		if (commentIndex !== -1) {
			post.comments[commentIndex].comment = req.body.comment;
			await post.save();
			return res.status(201).json({
				success: true,
				message: "Comment Updated",
			});
		} else {
			post.comments.push({
				user: req.user._id,
				comment: req.body.comment,
			});
		}
		await post.save();
		return res.status(201).json({
			success: true,
			message: "Comment Added",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const deleteComment = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(401).json({
				success: false,
				message: "Post not found",
			});
		}

		if (post.owner.toString() === req.user._id.toString()) {
			if (req.body.commentId == undefined) {
				return res.status(400).json({
					success: false,
					message: "Comment not found",
				});
			}
			post.comments.forEach((item, index) => {
				if (post._id.toString() === req.body.commentId.toString()) {
					return post.comments.splice(index, 1);
				}
			});
			await post.save();
			return res.status(201).json({
				success: true,
				message: "Selected post has been deleted",
			});
		} else {
			post.comments.forEach((item, index) => {
				if (item.user.toString() === req.user._id.toString()) {
					return post.comments.splice(index, 1);
				}
			});
			await post.save();

			return res.status(201).json({
				success: true,
				message: "Your comment has been deleted",
			});
		}
	} catch (error) {
		res.status(500).json({
			success: true,
			message: error.message,
			stack: error.stack,
		});
	}
};

const likeAndDislikePost = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(401).json({
				success: false,
				message: "Post not found!",
			});
		}

		if (post.likes.includes(req.user._id)) {
			const index = post.likes.indexOf(req.user._id);
			post.likes.splice(index, 1);

			await post.save();

			return res.status(201).json({
				success: true,
				message: "Post Disliked",
			});
		} else {
			post.likes.push(req.user._id);
			await post.save();
			return res.status(201).json({
				success: true,
				message: "Post Liked",
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			stack: error.stack,
		});
	}
};

export {
	createPost,
	likeAndDislikePost,
	deletePost,
	updatePost,
	addCommentAndUpdate,
	deleteComment,
	getAllPost,
};
