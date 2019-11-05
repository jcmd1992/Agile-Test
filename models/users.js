let mongoose = require('mongoose')

let UserSchema = new mongoose.Schema({
        userid: Number,
        email: String,
        administrator: String,
    },
    { collection: 'users' });

module.exports = mongoose.model('User', UserSchema);