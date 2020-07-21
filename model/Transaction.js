const mongoose = require('mongoose');


const Transaction = mongoose.Schema({
    AckID: {
        type: String,
        require: true
    },
    TID: {
        type: String,
        require: true
    },
    refID: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Transaction', Transaction);

