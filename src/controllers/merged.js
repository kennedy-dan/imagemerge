const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const sharp = require("sharp");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "drxdger3x",
  api_key: "334455267293735",
  api_secret: "OMEE6Liypwky-mEKvbYy0Lr8Tjc",
});

exports.mergedImagess = async (artworkUrl) => {
  try {
    console.log(process.env.CLOUDINARY_API_KEY);

    const artwork = await fetchImageBuffer(artworkUrl);
    if (!artwork || artwork.length === 0) {
      throw new Error("Artwork buffer is empty");
    }

    const products = ["cup", "pillow", "book", "iphone", "bag", "shirt"];
    const mergedImages = {};
    const mergedImagesBase64 = {}; // Add this for instant display

    for (const product of products) {
      const productUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${product}.png`;
      console.log(`Fetching product image from URL: ${productUrl}`);
      const productTexture = await fetchImageBuffer(productUrl);

      if (!productTexture || productTexture.length === 0) {
        throw new Error(`Product texture buffer for ${product} is empty`);
      }

      const { width: productWidth, height: productHeight } = await sharp(
        productTexture
      ).metadata();

      const resizedArtwork = await sharp(artwork)
        .resize(productWidth, productHeight, { fit: "cover" })
        .toBuffer();

      const { width: artworkWidth, height: artworkHeight } = await sharp(
        resizedArtwork
      ).metadata();

      const left = Math.floor((productWidth - artworkWidth) / 2);
      const top = Math.floor((productHeight - artworkHeight) / 2);

      const shiftRight = 13;
      const shiftDown = 0;

      const mergedImage = await sharp(productTexture)
        .composite([
          {
            input: resizedArtwork,
            blend: "overlay",
            left: shiftRight,
            top: shiftDown,
          },
        ])
        .sharpen()
        .modulate({ brightness: 1.2 }) // Increase brightness
        .toBuffer();

      // Upload merged image to Cloudinary
      // Convert to base64 for instant display
      const base64Image = mergedImage.toString("base64");
      mergedImagesBase64[product] = `data:image/png;base64,${base64Image}`;

      // Still upload to Cloudinary for permanent storage
      const uploadResult = await uploadToCloudinary(
        mergedImage,
        `merged_output_${product}`
      );
      mergedImages[product] = uploadResult.secure_url;
    }

    console.log("Images merged successfully!");
    return {
      urls: mergedImages, // Cloudinary URLs
      images: mergedImagesBase64, // Base64 for instant display
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
async function fetchImageBuffer(url) {
  console.log(`Fetching image from URL: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: publicId },
      (error, result) => {
        if (error) {
          console.log(`Error uploading ${publicId}:`, error);
          reject(error);
        } else {
          console.log(`Uploaded ${publicId} to Cloudinary:`, result.secure_url);
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
}
