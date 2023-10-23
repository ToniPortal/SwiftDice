// route.js - route module.
const express = require("express");
const control = express.Router();

control.get('/', function (req, res) {
    res.render("index")
});

module.exports = control;