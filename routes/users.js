let User = require("../models/users");
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

    User.find(function(err, messages) {
        if (err)
            res.send(err);

        res.send(JSON.stringify(messages,null,5));
    });
};

/*router.findOne = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    User.find({ "usersid" : req.params.id },function(err, message) {
        if (err)
            res.json({ message: 'User NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(message,null,5));
    });
}*/

router.addUser = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    var user = new User();

    user.userid = req.body.userid;
    user.email = req.body.email;
    user.administrator = req.body.administrator;

    user.save(function(err) {
        if (err)
            res.json({ message: 'User NOT Added!', errmsg : err } );
        else
            res.json({ message: 'User Successfully Added!', data: user });
    });
}
module.exports = router;