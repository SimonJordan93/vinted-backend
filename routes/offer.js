const express = require("express");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log("Je rentre dans ma route");
      // console.log(req.user);
      //   console.log(req.body);
      // console.log(req.files);
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      //   console.log(result);
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        // product_image: result,
        owner: req.user,
      });
      const picture = req.files.picture;
      const result = await cloudinary.uploader.upload(convertToBase64(picture));
      // console.log(result);
      newOffer.product_image = result;
      await newOffer.save();
      //   const response = await Offer.findById(newOffer._id).populate(
      //     "owner",
      //     "account"
      //   );
      //   console.log(newOffer);
      //   res.json(response);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }

    const sortFilter = {};

    if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    }
    if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    }

    const limit = 5;

    let pageRequired = 1;
    if (page) {
      pageRequired = Number(page);
    }

    const skip = (pageRequired - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account _id");

    const count = await Offer.countDocuments(filters);

    const response = {
      count: count,
      offer: offers,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params);
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// FIND
//   const regExp = /chaussettes/i;
//   const regExp = new RegExp("e", "i");
//   const results = await Offer.find({ product_name: regExp }).select(
//     "product_name product_price"
//   );

//   FIND AVEC FOURCHETTES DE PRIX
//   $gte =  greater than or equal >=
//   $lte = lower than or equal <=
//   $lt = lower than <
//   $gt = greater than >
//   const results = await Offer.find({
//     product_price: {
//       $gte: 55,
//       $lte: 200,
//     },
//   }).select("product_name product_price");

//   SORT
//   "asc" === "ascending" === 1
//   "desc" === "descending" === -1
//   const results = await Offer.find()
//     .sort({ product_price: -1 })
//     .select("product_name product_price");

//   ON PEUT TOUT CHAINER
// const results = await Offer.find({
//   product_name: /vert/i,
//   product_price: { $gte: 20, $lte: 200 },
// })
//   .sort({ product_price: -1 })
//   .select("product_name product_price");

//   SKIP ET LIMIT
//   const results = await Offer.find()
//     .skip(10)
//     .limit(5)
//     .select("product_name product_price");

// res.json(results);

module.exports = router;
