const express = require("express");
const env = require("dotenv");
const app = express();
const cors = require("cors");

const mergeRoute = require("./src/routes/mergeRoute");

env.config();
const port = process.env.PORT || 2000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.use("/api", mergeRoute)


env.config();

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
