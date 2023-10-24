// route.js - route module.
const express = require("express");
const control = express.Router();

control.get('/', function (req, res) {
    res.render("index")
});

control.get('/test', function (req, res) {
    res.render("test")
});

module.exports = control;