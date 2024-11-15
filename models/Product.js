const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
//import paginate from 'mongoose-paginate-v2';

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array },
    size: { type: Array },
    color: { type: Array },
    pcollectionid: { type: String, required: true }, // Reference to Collection
    pcollection: { type: String, required: true },
    price: { type: Number, required: true },
    originalprice: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    inTrending: { type: Boolean, default: false },
    inFeatured: { type: Boolean, default: false },
}, { timestamps: true });

ProductSchema.plugin(paginate);
// ProductSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Product", ProductSchema);