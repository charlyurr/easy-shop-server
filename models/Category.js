const { default: mongoose } = require("mongoose");

// Schema
const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
});

// Model
exports.Category = mongoose.model("Category", categorySchema);
