const mongoose = require("mongoose");

const WebnotifySchema = new mongoose.Schema({
    subkeys: { type: Object, required: true }
}, { timestamps: true });
module.exports = mongoose.model("Webnotify", WebnotifySchema);