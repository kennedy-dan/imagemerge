const express = require("express");
const env = require("dotenv");
const cors = require("cors");

// Load environment variables FIRST
env.config();

const app = express();
const mergeRoute = require("./src/routes/mergeRoute");

const port = process.env.PORT || 2000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static("public"));

app.use("/api", mergeRoute);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(
    `📋 Environment loaded: ${
      process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌"
    } Cloudinary configured`
  );
});
