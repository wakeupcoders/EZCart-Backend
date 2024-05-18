const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const ClientSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientAddress: { type: String, required: true },
    clientEmail: { type: String, required: true, unique: true },
    clientPhone: { type: String, required: true },
    clientLogo: { type: String, required: true},
    clientGoogleMapIframe: { type: String, required: true},
}, { timestamps: true });
ClientSchema.plugin(paginate);
module.exports = mongoose.model("Client", ClientSchema);