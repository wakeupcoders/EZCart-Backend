const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');
//import paginate from 'mongoose-paginate-v2';

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array },
    size: { type: Array },
    color: { type: Array },
    pcollection: { type: String, required: true },
    price: { type: Number, required: true },
    originalprice: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.plugin(paginate);

module.exports = mongoose.model("Product", ProductSchema);