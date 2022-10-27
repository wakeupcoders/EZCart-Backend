const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    receiverName: { type: String, required: true },
    addressTitle: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    defAddress: { type: Boolean, default: false }

}, { timestamps: true });
module.exports = mongoose.model("Address", AddressSchema);