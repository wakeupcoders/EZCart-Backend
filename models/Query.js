const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const QueriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });
QueriesSchema.plugin(paginate);
module.exports = mongoose.model("Queries", QueriesSchema);
