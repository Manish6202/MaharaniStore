const mongoose = require('mongoose');


const playerSchema = new mongoose.Schema({
    name : String,
    age : String,
    address: String,
    mobile: String,
    playingStyle : String,
    playerType : String,
    unavailability : String,
    remarks : String,
    photoUrl : String,
    receiptUrl : String,
    date : {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('player', playerSchema);