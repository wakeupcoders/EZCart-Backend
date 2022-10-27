const mongoose = require("mongoose");

const MFASchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    secret: { type: Object, required: true },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("MFA", MFASchema);