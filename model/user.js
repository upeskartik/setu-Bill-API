const mongoose = require('mongoose');


const User = mongoose.Schema({
    mobileNumber: {
        type: String,
        require: true,
        unique: true
    },
    customerName: {
        type: String,
        require: true
    },
    dueAmount: {
        type: Number,
        min: 0,
    },
    dueDate: {
        type: Date
    },
    refID: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', User);

