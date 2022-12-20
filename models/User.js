const { default: mongoose } = require("mongoose");

// Schema
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String, required: true },
  city: { type: String, default: "" },
  zip: { type: String, default: "" },
  country: { type: String, default: "" },
});

// Virtuals, create a product is without underscore
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// enanable virtuals
userSchema.set("toJSON", { virtuals: true });

// Model
exports.User = mongoose.model("User", userSchema);
