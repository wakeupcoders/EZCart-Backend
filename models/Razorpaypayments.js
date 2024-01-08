const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const PaymentSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    ezcart_order_id: { type: String, required: true },
    paymentstatus: {type: Boolean,default: false,},
}, { timestamps: true });
PaymentSchema.plugin(paginate);
module.exports = mongoose.model("Payment", PaymentSchema);