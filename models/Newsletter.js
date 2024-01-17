const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const NewsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    status: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });
NewsletterSchema.plugin(paginate);
module.exports = mongoose.model("Newsletter", NewsletterSchema);