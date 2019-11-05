var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");


const messages = require("./routes/messages");
const users = require("./routes/users");



var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// My custom Web App Routes
app.get("/messages", messages.findAll);
app.get("/messages/:id", messages.findOne);
app.post('/messages',messages.addMessage);
app.delete('/messages/:id', messages.deleteMessage);

app.get("/users", users.findAll);
//app.get("/users/:id", users.findOne);
app.post('/users',users.addUser);
app.delete('/users/:id', users.deleteUser);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});




module.exports = app;