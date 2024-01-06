const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');


const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{
        productId: {
            type: String,
        },
        quantity: {
            type: Number,
            default: 1,
        },
    }, ],
    receiverName: { type: String, required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    couponcode: { type: String, default: "NO COUPON" },
    pmode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "pending" },
}, { timestamps: true });
OrderSchema.plugin(paginate);
module.exports = mongoose.model("Order", OrderSchema);