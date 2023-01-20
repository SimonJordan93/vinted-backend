const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

// Je me connect à mon compte cloudinary avec les identifiants présents sur mon compte
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Import de mes routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
// je dis à mon serveur d'utiliser mes routes
app.use(userRoutes);
app.use(offerRoutes);

// Undifined Routes
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

// Communication avec le serveur
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
