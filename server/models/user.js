const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true, unique: true },
  password:{ type: String, required: true },
  isAdmin: { type: Boolean, default: false },

  // 🔹 New fields for profile
  phone:   { type: String, default: "" },
  address: {
    street:  { type: String, default: "" },
    city:    { type: String, default: "" },
    state:   { type: String, default: "" },
    pincode: { type: String, default: "" },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
