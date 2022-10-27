const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');


const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    thresholdAmount: { type: Number, required: true },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
}, { timestamps: true });

CouponSchema.plugin(paginate);


module.exports = mongoose.model("Coupon", CouponSchema);