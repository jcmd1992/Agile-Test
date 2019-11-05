let mongoose = require("mongoose");

let MessageSchema = new mongoose.Schema({
    messageid: Number,
    usersid: Number,
    messages: String
},
{ collection: "messages" });

module.exports = mongoose.model("Message", MessageSchema);