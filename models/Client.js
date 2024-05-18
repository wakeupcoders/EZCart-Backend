const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const ClientSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientAddress: { type: String, required: true },
    clientEmail: { type: String, required: true, unique: true },
    clientPhone: { type: String, required: true },
    clientLogo: { type: String, required: true},
    clientLogoText: { type: String, required: true},
    clientIsLogoText: { type: Boolean,  default: true},
    clientGoogleMapIframe: { type: String, required: true},
    clientAbout: { type: String, required: true},
    clientStory: { type: String, required: true},
    clientMission: { type: String, required: true},
    clientFacebook: { type: String},
    clientInstagram: { type: String},
    clientPinterest: { type: String},
    clientWhatsapp: { type: String},
    clientLinkedin: { type: String},
}, { timestamps: true });
ClientSchema.plugin(paginate);
module.exports = mongoose.model("Client", ClientSchema);