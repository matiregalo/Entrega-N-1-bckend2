import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  price: { type: Number, min: 0 },
  stock: { type: Number, min: 0, default: 0 },
  category: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    default: "general",
  },
});

export default model("Product", productSchema);
