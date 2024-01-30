//Tout les npm utilisé pour le projet.
const express = require('express'),
    path = require('path'),
    config = require("./config/config.json"),
    port = (process.env.PORT || process.env.ALWAYSDATA_HTTPD_PORT || config.port),
    ip = (process.env.IP || process.env.ALWAYSDATA_HTTPD_IP, config.ip);


const compression = require('compression');

app = express();

app.set('view engine', 'ejs');

app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/th', express.static(path.join(__dirname, 'build')));

app.use(compression());


const server = app.listen(port, ip, err => {
    err ?
        console.log("Error in server setup") :
        console.log(`Worker ${process.pid} started\nServeur lancer sur: http://${ip}:${port}`);

});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by'); //Désactive le header x-powered-by
// app.use(helmet()) // Protection contre absolument tout

// Mes route (Tout mes get qui ne nécessite pas de bdd)
const route = require("./control/route.js");
app.use("/", route);

//Connection via un ficher a la bdd
// let dbsql = require('./config/connectdb');

// dbsql.init(function (error) {

//     if(error){
//         console.warn("[BDD]",error);
//     }

//     const authRoute = require("./control/authRoute.js");
//     app.use("/", authRoute);

//     const auth = require("./control/auth.js");
//     app.use("/auth", auth);

//     const anime = require("./control/anime.js");
//     app.use("/anime", anime);

// });