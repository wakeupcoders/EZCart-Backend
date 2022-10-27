const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');


const feedbackSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: String, required: true },
    review: { type: String, required: true },
    reviewSentiments: { type: Object, required: true }

}, { timestamps: true });

feedbackSchema.plugin(paginate);
module.exports = mongoose.model("Feedback", feedbackSchema);