import mongoose from "mongoose";

const user = new mongoose.Schema({
  role: { type: String, default: "user", enum: ["user", "admin"] },
  name: { type: String, trim: true, maxlength: 100 },
  age: { type: Number, min: 0, max: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  created_at: { type: Date, default: Date.now }
})

export const User = mongoose.model("user",user)