const cloudinary = require("cloudinary");
const fs = require("fs");
const formidable = require("formidable");

const { mergedImagess } = require("./merged");

const sharp = require("sharp");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "drxdger3x",
  api_key: "334455267293735",
  api_secret: "OMEE6Liypwky-mEKvbYy0Lr8Tjc",
});

exports.mergedImages = async (req, res) => {
  // Set CORS headers
  console.log("Received request method:", req.method);
  console.log("Request headers:", req.headers);
  console.log(process.env.CLOUDINARY_API_KEY);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ error: "Error parsing the file" });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        // Upload file to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload(file.filepath, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        console.log("Cloudinary upload result:", uploadResult);

        // Merge images using the Cloudinary URL
        const mergedImages = await mergedImagess(uploadResult.secure_url);

        res.status(200).json({
          message: "Images merged successfully!",
          imageUrls: mergedImages,
        });
      } catch (error) {
        console.error("Error processing image:", error);
        res
          .status(500)
          .json({ error: "Error processing image", details: error.message });
      }
    });
  } else {
    console.error("Method not allowed:", req.method);
    res.status(405).json({ error: "Method not allowed" });
  }
};

exports.mergeFromUrl = async (req, res) => {
  // Set CORS headers
  console.log("Received URL merge request method:", req.method);
  console.log("Request headers:", req.headers);
  console.log(process.env.CLOUDINARY_API_KEY);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "No image URL provided" });
      }

      try {
        new URL(imageUrl);
      } catch (urlError) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      console.log("Processing image from URL:", imageUrl);

      const mergedImages = await mergedImagess(imageUrl);

      res.status(200).json({
        success: true,
        message: "Images merged successfully from URL!",
        imageUrls: mergedImages,
      });
    } catch (error) {
      console.error("Error processing image from URL:", error);
      res
        .status(500)
        .json({
          error: "Error processing image from URL",
          details: error.message,
        });
    }
  } else {
    console.error("Method not allowed:", req.method);
    res.status(405).json({ error: "Method not allowed" });
  }
};
