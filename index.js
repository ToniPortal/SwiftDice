import express from 'express';
import path from 'path';
// Importez `readFileSync` pour lire le fichier JSON
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync(path.resolve(__dirname, 'config', 'config.json'), 'utf-8'));
import ejs from "ejs";
import fs from 'fs';
// ...


app = express();

app.set('view engine', 'ejs');

app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/th', express.static(path.join(__dirname, '/node_modules/three/build')));
app.use('/enable3d', express.static(path.join(__dirname, '/node_modules/@enable3d')));


//ENABLE 3D
// const { enable3d, THREE, physics } = require('@enable3d/ammo-physics');
// enable3d(app, {
//     path: '/enable3d', // Le chemin vers enable3d sur votre serveur
// });


server = app.listen(port, ip, err => {
    err ?
        console.log("Error in server setup") :
        console.log(`Worker ${process.pid} started\nServeur lancer sur: http://localhost:${port}`);

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


