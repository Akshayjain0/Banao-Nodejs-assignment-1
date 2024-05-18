import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
	encryptedCaption: String,
	ivCaption: String,
	image: {
		public_id: String,
		encryptedImgUrl: String,
		ivImgUrl: String,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	comments: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			comment: {
				type: String,
				required: true,
			},
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Post = mongoose.model("Post", postSchema);
export default Post;
