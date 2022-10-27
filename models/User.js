const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    MFAEnabled: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "user",
    },
    external_login: {
        type: Boolean,
        default: false,
    },
    external_login_id: { type: String },

    img: { type: String },
}, { timestamps: true });
UserSchema.plugin(paginate);
module.exports = mongoose.model("User", UserSchema);