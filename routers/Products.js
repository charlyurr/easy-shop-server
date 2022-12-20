const express = require("express");
const { Category } = require("../models/Category");
const { Product } = require("../models/Product");
require("dotenv/config");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { request } = require("express");

// Acceptable file types for upload
const FILE_TYPE_MAP = {
  // MIME type farmt >> 'image/png'
  // Define the type of file coming to the backend
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
// Configure mutler
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidFile = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    // FIXME: Validation not working properly, html file uploaded
    if (isValidFile) {
      uploadError = null;
    }
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// Get all products
// Filtering and getting products by category
router.get(`/`, async (req, res) => {
  // Get all fileds
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter);

  // const productList = await Product.find().populate("category");

  // select particular columns
  // const productList = await Product.find().select("name image");

  // select particular columns, exclude id column(-_id)
  // const productList = await Product.find().select("name image -_id");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// Get product by ID
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id);

  // Get category details from category table
  // const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

// Add products
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  console.log("product");
  // Validate category
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }

  const file = req.file;
  if (!file) {
    return res.status(400).send("No image attached in the request");
  }
  // Get file name
  const fileName = req.file.filename;

  // Build full path to image
  // get host from request
  // https://www.geeksforgeeks.org/express-js-req-protocol-property/
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  product = await product.save();
  if (!product) return res.status(500).send("Product could not be added");

  res.send(product);

  console.log("req.body");
});

// .catch((err) => {
//       res.send()
// });

// Update a product
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid product ID");
  }
  // Validate category
  const category = await Category.findById(req.body.category);
  if (!category) {
    console.log(category);
    return res.status(400).send("Invalid category");
  }

  //
  const file = req.file;
  let imagePath;
  if (file) {
    // Get file name
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true } // return the new product
  );

  if (!updatedProduct) {
    res.status(404).send("Product could not be updated");
  }
  res.send(updatedProduct);
});

// Delete a product
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        res
          .status(200)
          .json({ success: true, message: "Product deleted successfully!" });
      } else {
        res.status(404).json({ success: false, message: "ID not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({ count: productCount });
});

// Featured API with limit
router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

// Add Multiple images to a product
router.put(
  // "/gallery-images:id",
  "/gallery-images/:id",
  uploadOptions.array("images"),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid product ID");
    }

    // Intialise array of images
    const files = req.files;
    console.log("files: ", files);
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true } // return the new product
    );

    if (!product) {
      res.status(404).send("Product could not be updated");
    }
    res.send(product);
  }
);

module.exports = router;
