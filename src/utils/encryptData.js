import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);

const encrypt = (caption, imagUrl) => {
	const ivCaption = crypto.randomBytes(16);
	const ivImgUrl = crypto.randomBytes(16);

	const captionCipher = crypto.createCipheriv(
		algorithm,
		Buffer.from(key),
		ivCaption
	);
	const imgUrlCipher = crypto.createCipheriv(
		algorithm,
		Buffer.from(key),
		ivImgUrl
	);

	let encryptedCaption = captionCipher.update(caption, 'utf8', 'hex');
	encryptedCaption += captionCipher.final('hex');

	let encryptedImgUrl = imgUrlCipher.update(imagUrl, 'utf8', 'hex');
	encryptedImgUrl += imgUrlCipher.final('hex');

	return {
		ivs: {
			ivCaption: ivCaption.toString("hex"),
			ivImgUrl: ivImgUrl.toString("hex"),
		},
		encryptedData: {
			encryptedCaption,
			encryptedImgUrl,
		},
	};
};

const decrypt = (encryptedData, ivs) => {
	const ivCaption = Buffer.from(ivs.ivCaption, "hex");
	const captionDecipher = crypto.createDecipheriv(
		algorithm,
		Buffer.from(key),
		ivCaption
	);
	let decryptedCaption = captionDecipher.update(
		encryptedData.encryptedCaption,
		"hex",
		"utf8"
    );
	decryptedCaption += captionDecipher.final("utf8");

	const ivImgUrl = Buffer.from(ivs.ivImgUrl, "hex");
	const imgUrlDecipher = crypto.createDecipheriv(
		algorithm,
		Buffer.from(key),
		ivImgUrl
	);
	let decryptedImgUrl = imgUrlDecipher.update(
		encryptedData.encryptedImgUrl,
		"hex",
		"utf8"
	);
	decryptedImgUrl += imgUrlDecipher.final("utf8");

	return {
		decryptedCaption,
		decryptedImgUrl,
	};
};

export { encrypt, decrypt };
