const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    mobilePhone: String,
    officePhone: String,
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },

    firstLogin: {
        type: Boolean,
        default: true,
    },
    connected: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", userSchema);