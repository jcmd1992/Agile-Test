let Message = require("../models/messages");
let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");


const connectionString = "mongodb://localhost:27017/pearlharbordb";
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


module.exports = router;