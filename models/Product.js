const { default: mongoose } = require("mongoose");

// Schema
const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  richDescription: { type: String, default: "" },
  image: { type: String, default: "" },
  images: [{ type: String }],
  brand: { type: String },
  price: { type: Number, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  countInStock: { type: Number, required: true, min: 0, max: 255 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  // reviews: { type: String },
  isFeatured: { type: Boolean, default: false },
  dateCreated: { type: Date, default: Date.now },
});

// Virtuals, create a product is without underscore
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// enanable virtuals
productSchema.set("toJSON", { virtuals: true });

// Model
exports.Product = mongoose.model("Product", productSchema);
