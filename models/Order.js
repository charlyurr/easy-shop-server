const { default: mongoose } = require("mongoose");

/**
 * 
 Order Example:
 {
  "orderItems": [
    {
      "quantity": 3,
      "productId": "636abed52968b82e52a87efb"
    },
    {
      "quantity": 3,
      "productId": "636abf14ee9d47c9771a9bb4"
    },
  ],
  "shippingAddress1": "29 Fist Street",
  "shippingAddress2": "29 Second Street",
  "city": "Windhoek",
  "zip": "0000",
  "country": "Namibia",
  "phone": "0103099288",
  "status": { type: String, required: true, default: "Pending" },
  user: "636d64ccc4569efeb1fb907d"
 }

 */
// Schema
const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: { type: String, required: true },
  shippingAddress2: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, required: true, default: "Pending" },
  totalPrice: { type: Number },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

// Virtuals, create a product is without underscore
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// enanable virtuals
orderSchema.set("toJSON", { virtuals: true });

// Model
exports.Order = mongoose.model("Order", orderSchema);
