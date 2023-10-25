// route.js - route module.
const express = require("express");
const control = express.Router();

control.get('/cube', function (req, res) {
    res.render("testcubemulti")
});

control.get('/test', function (req, res) {
    res.render("test")
});

control.get('/', function (req, res) {
    res.render("rpgdice")
});

module.exports = control;