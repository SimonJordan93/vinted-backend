const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost/vinted");

// Je me connect à mon compte cloudinary avec les identifiants présents sur mon compte
cloudinary.config({
  cloud_name: "dhewxj0jc",
  api_key: "329878291481536",
  api_secret: "xe_92Fb4hZSL2B9xGfKaLDywMUs",
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
app.listen(3003, () => {
  console.log("Server started");
});
