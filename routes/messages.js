let Message = require("../models/messages");
let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config()

const connectionString = process.env.MONGO_URI;
mongoose.connect(connectionString);

let db = mongoose.connection;

db.on("error", function (err) {
    console.log("Unable to Connect to [ " + db.name + " ]", err);
});

db.once("open", function () {
    console.log("Successfully Connected to [ " + db.name + " ]");
});

router.findAll = (req, res) => {
    // Return a JSON representation of our list
    res.setHeader("Content-Type", "application/json");

    Message.find(function(err, messages) {
        if (err)
            res.send(err);

        res.send(JSON.stringify(messages,null,5));
    });
};

router.findOne = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    Message.find({ "messageid" : req.params.id },function(err, message) {
        if (err)
            res.json({ message: 'Message NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(message,null,5));
    });
}

router.addMessage = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    var message = new Message();

    message.messageid = req.body.messageid;
    message.usersid = req.body.usersid;
    message.messages = req.body.messages;

    message.save(function(err) {
        if (err)
            res.json({ message: 'Message NOT Added!', errmsg : err } );
        else
            res.json({ message: 'Message Successfully Added!', data: message });
    });
}

router.deleteMessage = (req, res) => {

    Message.findByIdAndRemove({"messageid": req.params.id}, function (err) {
        if (err)
            res.json({message: "Message NOT DELETED"});
        else
            res.json({message: "Message Successfully Deleted!"});
    });
};


module.exports = router;