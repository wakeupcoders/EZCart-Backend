const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const collectionSchema = new mongoose.Schema({

    colName: { type: String, required: true },
    colDesc: { type: String, required: true },
    colImg: { type: String, required: true },

}, { timestamps: true });
collectionSchema.plugin(paginate);
module.exports = mongoose.model("Collection", collectionSchema);