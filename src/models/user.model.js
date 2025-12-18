import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    age: { type: Number, min: 0, max: 120 },
    password: { type: String, required: true },
    ticket: { type: Schema.Types.ObjectId, ref: "ticket", default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

export default model("User", userSchema);
