import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const LabSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "lab" },
  
  contact: { type: String },
  address: { type: String },
  tests: [{ type: String }],
});

//  Hash password before saving
LabSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next(); // only hash if new or changed
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
});

export default mongoose.model("Lab", LabSchema);
