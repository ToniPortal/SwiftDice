import * as THREE from '/th/three.module.js';

var scene, camera, renderer, // la camera et la scene
    world, body1, groundBody, //Le sol et les corps de physique
    cube1, ground, moveplayer = true, // Les joueurs 1 cube
    dice = [], maxrebonddice = 3, // Les lancée de dès
    ennemy = [], choicy, //Coresspond au variable de l'ennemy
    ennemymain = [];

const timeDice = 750;
const timeTour = 1500;

var character = [ // Les personnage
    {
        index: 1, name: "Voleur", pv: 4, maxpv: 4, color: "orange",
        face: ["atk", "atk", "atk", "atk", "atk", "atk"], dmg: 999, choiceface: "nop",
        whofight: ""
    },
    {
        index: 2, name: "Gardien", pv: 7, maxpv: 7, color: "gray",
        face: ["nop", "atk", "nop", "nop", "atk", "atk"], dmg: 1, choiceface: "nop",
        whofight: ""
    },
    {
        index: 3, name: "Combattant", pv: 5, maxpv: 5, color: "green",
        face: ["nop", "atk", "nop", "nop", "atk", "atk"], dmg: 1, choiceface: "nop",
        whofight: ""
    },
    {
        index: 4, name: "Healer", pv: 5, maxpv: 5, color: "red",
        face: ["nop", "atk", "nop", "nop", "atk", "atk"], dmg: 1, choiceface: "nop",
        whofight: ""
    },
    {
        index: 5, name: "Mage", pv: 4, maxpv: 4, color: "blue",
        face: ["nop", "atk", "nop", "nop", "atk", "atk"], dmg: 1, choiceface: "nop",
        whofight: ""
    }
];

//atk ou nop
var ennemynames = [{ name: "Nullos", face: ["atk", "atk", "atk", "atk", "atk", "atk"], dmg: 2, color: "red" },
{ name: "PafLechien", face: ["atk", "atk", "atk", "atk", "atk", "atk"], dmg: 1, color: "blue" }];

// Geometry (couleur du cube) des ennemy
const ennemyGeometry = new THREE.BoxGeometry(1, 2, 1);
const ennemyMaterial = new THREE.MeshBasicMaterial({ color: 0xDC143C });


async function updateGravity(x, y, z) {
    try {
        await world.gravity.set(x, y, z);
    } catch (e) {
        console.warn(e)
    }

}

function affichageInfo(string) {
    // alert(string)
    document.getElementById("h4info").innerText = string;
}

function init() {
    // Three.js setup
    // scene = new THREE.Scene();
    // camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera.position.set(0, 10, 30); // Position de la caméra
    // camera.lookAt(0, 0, 0); // Point de regard de la caméra
    scene = new THREE.Scene();


    world = new OIMO.World({
        info: true,
        random: true,  // randomize sample
        gravity: [0, -20, 0],
    });

    // Create ground
    var groundSize = [50, 1, 50]; // Adjust the size as needed
    var groundPosition = [0, -5, 0]; // Position it slightly below the center
    groundBody = world.add({
        type: 'box',
        size: groundSize,
        pos: groundPosition,
        move: false // Set the ground as static
    });

    // Create cube 1
    var size1 = [1, 1, 1];
    var position1 = [-20, -4, 0];
    body1 = world.add({
        type: 'box',
        size: size1,
        pos: position1,
        move: true
    });


    // Create ground geometry and material for Three.js
    var groundGeometry = new THREE.BoxGeometry(groundSize[0], groundSize[1], groundSize[2]);
    var groundMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    // Create ground mesh
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(groundPosition[0], groundPosition[1], groundPosition[2]);
    scene.add(ground);

    // Create cube geometry and material for Three.js
    var geometry = new THREE.BoxGeometry(size1[0], size1[1], size1[2]);

    // Create le joueurs
    cube1 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x030AF0 }));
    cube1.position.set(position1[0], position1[1], position1[2]);

    //Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 20, 40);
    cube1.add(camera);
    camera.lookAt(new THREE.Vector3(0, 2, 0));


    //Ajout du joueurs a la scene :
    scene.add(cube1);

} //Fin init

const diceGeometry = new THREE.BoxGeometry(1, 1, 1);
const diceMaterial = new THREE.MeshBasicMaterial({ color: 0xF02003 });

function createdice(allye, bl, x, y, z) {
    console.log("Création de dès")
    // Create cube 2 avec les x y z de la function
    let size2 = [1, 1, 1]; //La taille
    let position2 = [x, y, z];
    let body2 = world.add({
        type: 'box',
        size: size2,
        pos: position2,
        move: true
    });

    // Create cube 2 mesh
    let cube2 = new THREE.Mesh(diceGeometry, diceMaterial);
    cube2.position.set(position2[0], position2[1], position2[2]);
    scene.add(cube2);

    if (allye) {
        dice.push({ cube: cube2, body: body2, name: character[bl].name, face: character[bl].face, facerand: rand(0, 5), clicked: false, rebond: 0, ally: allye, force: { x: rand(-3, 3), y: rand(6, 10), z: rand(-3, 3) }, rotation: { x: 5, y: 5, z: 5 } });
    } else {
        dice.push({ cube: cube2, body: body2, name: ennemynames[bl].name, face: ennemynames[bl].face, rebond: 0, facerand: rand(0, 5), ally: allye, force: { x: rand(-3, 3), y: rand(6, 10), z: rand(-3, 3) }, rotation: { x: 5, y: 5, z: 5 } });
    }
}

var allyinter;

function allyinterval() {
    affichageInfo("Lancée dès Alliès !")
    console.log(dice + "; Création de dès alliés !")
    let x = 0
    let bl = 0
    allyinter = setInterval(async () => {
        if (dice.length < 5) {
            createdice(true, bl, x, 5, 0);
            x += 0.2;
        } else {
            clearInterval(allyinter) //Finir les lancer des dès

            //Ally Commencer a dire qui il va attaquer et les attaquer.
            affichageInfo("Veuillez choisir le dès de chaque character !")
        }
        bl++;
    }, timeDice);
}


var ennemyinter;

function ennemyinterval() {
    affichageInfo("Lancée dès ennemy !")
    let bl = 0;
    ennemyinter = setInterval(async () => {
        if (dice.length < ennemy.length) {
            createdice(false, bl, 0, 5, 0);
        } else {
            clearInterval(ennemyinter) //Finir les lancer des dès

            affichageInfo("Choix des ennemy")
            //Ennemy Commencer a dire qui il va attaquer et les attaquer.
            await choicingennemy(); //Lancer le choix
            //Lancer l'alliée !
            setTimeout(async function () {
                await killAllDice();
                setTimeout(async function () {
                    allyinterval()
                }, 250)
            }, timeTour)
        }
        bl++;
    }, timeDice);
}

function killAllDice() {
    return new Promise((resolve) => {

        dice.forEach((di, i) => {
            kill(di) //Kill et delete l'array des dès
            if (i == dice.length - 1) {
                dice = [];
                resolve();
            }
        })
    })
}

function createMainEnnemy(x, y, z) {
    // Create cube avec les x y z de la function
    let body = world.add({
        type: 'box',
        size: [1, 2, 1,],
        pos: [x, y, z],
        move: false
    });

    let cube = new THREE.Mesh(ennemyGeometry, ennemyMaterial);
    cube.position.set(x, y, z);
    scene.add(cube);
    ennemymain.push({ cube: cube, body: body })
}


function choicingennemy() {
    const promises = ennemy.map((el, i) => {
        return new Promise((resolve) => {
            let qui = character[rand(0, character.length - 1)];
            el.fight = qui.name;
            document.getElementById(`titreennemy${i}`).lastElementChild.style = `border: 5px dashed ${qui.color}`

            let fac = el.face[rand(0, 5)]
            document.getElementById(`titreennemy${i}`).getElementsByClassName("card-text")[0].innerHTML = `${fac} -> <b>${qui.name} = ${el.dmg}</b>`;
            el.choiceface = fac;

            resolve();
        });
    });

    return Promise.all(promises);
}




function createcharacter() {
    return new Promise((resolve) => {

        let i = 1;
        while (i < 6) {

            let selectElement = document.querySelector(`select[name="classe${i}"]`);
            let selectedOption = selectElement.options[selectElement.selectedIndex];
            let vname = selectedOption.text;

            changeally(vname, i)

            if (i == 5) {
                resolve() //Lorsque que on est dernier paf dit que on a fini
            }
            i++;
        }
    });
}


// Permet de changer les nom d'un alliée et ses pv,il faut spécifier son nombre de 1 à 5;(sert lorsque on fight !)
function changeally(name, nb, pv) {
    let vpv;
    let t = document.getElementById(`titreclasse${nb}`);
    let maxpv = character[nb - 1].maxpv;
    if (pv) {
        vpv = pv;
        character[nb - 1].pv = pv;
    } else {
        vpv = character[nb - 1].maxpv;
        t.lastElementChild.firstElementChild.setAttribute("aria-valuemax", vpv)    // Max pv progress bar
    }
    console.log(`[AllyChange] Les pv dans la func ${pv}\nVar vpv = ${vpv}\nValeur max pv${maxpv}\nL'index du truc est : ${nb}`)

    if (vpv <= 0) {
        alert(character[nb - 1].name + " est mort !");
        character.splice(nb - 1, 1);

        vpv = 0;
    }
    // Set les valeur de la barre de progression
    t.lastElementChild.firstElementChild.setAttribute("aria-valuenow", vpv)

    t.lastElementChild.firstElementChild.lastElementChild.innerText = `${vpv}/${maxpv}`
    t.lastElementChild.firstElementChild.lastElementChild.style = `width: ${(vpv / maxpv) * 100}%`;

    // Changer le nom
    if (name != "") {
        t.firstElementChild.innerText = name;
    }




}

function createennemy() {
    return new Promise((resolve) => {

        document.getElementById("ennemydiv").style = `position: relative;bottom: 460px;left: ${window.innerWidth / 1.176}px;`

        let nbennemy = 1; // Initialiser nombre d'ennemy
        let vpv = rand(10, 20);
        //Changer le nb de monstre par rapport a la difficulter du nombre de monstre
        if (choicy.difficulty == "option1") {
            // nbennemy = 1; //Si c'est facile
        } else if (choicy.difficulty == "option2") {
            // nbennemy = 2; // Si c'est normal
        } else {
            // nbennemy = 4 //Si c'est difficile
        }


        let bl = 0;
        while (bl < nbennemy) {
            let randen = ennemynames[rand(0, ennemynames.length - 1)];
            ennemy.push({
                name: randen.name, pv: vpv, maxpv: vpv, dmg: randen.dmg, fight: "?", face: randen.face, choiceface: "nop",
                color: randen.color
            })
            document.getElementById("ennemydiv").innerHTML += `<div class="col ms-auto">
        <div id="titreennemy${bl}" class="card wd-50 rounded-0" style="width: 15%">
            <h5 class="card-header">${randen.name}</h5>
            <div class="card-body">
                <div class="progress" role="progressbar" aria-valuenow="${vpv}"
                    aria-valuemin="0" aria-valuemax="${vpv}">
                    <div class="progress-bar bg-${randen.color}" style="width: 100%">${vpv}/${vpv}</div>
                </div>
                <p class="card-text">??</p>
            </div>
        </div>
        </div>`

            if (bl == nbennemy - 1) {
                resolve()
            }

            bl++;
        }

    });

}

//Permet de changer les ennemy(donc quand c'est le tour du joueurs)
function changeEnnemy(nb, pv) {
    let vpv;
    let t = document.getElementById(`titreennemy${nb}`);
    console.log(`Array Ennemy n°${nb}?`, ennemy)
    let maxpv = ennemy[nb].maxpv;
    if (pv) {
        vpv = pv;
        ennemy[nb].pv = pv;
    } else {
        vpv = ennemy[nb].maxpv;
        t.lastElementChild.firstElementChild.setAttribute("aria-valuemax", vpv)    // Max pv progress bar
    }
    console.log(`[EnnemyChange] Les pv dans la func ${pv}\nVar vpv = ${vpv}\nValeur max pv${maxpv}\nL'index du truc est : ${nb}`)

    if (vpv <= 0) {
        alert(ennemy[nb].name + " est mort !")
        ennemy.splice(nb, 1);

        vpv = 0; //Remettre a 0
    }
    // Set les valeur de la barre de progression
    t.lastElementChild.firstElementChild.setAttribute("aria-valuenow", vpv)

    t.lastElementChild.firstElementChild.lastElementChild.innerText = `${vpv}/${maxpv}`
    t.lastElementChild.firstElementChild.lastElementChild.style = `width: ${(vpv / maxpv) * 100}%`;


}

function deathEnnemy() {
    if (deathone == false) {
        deathone = true;
        moveplayer = true;
        killAllDice();

        document.getElementById("ennemydiv").innerHTML = "";
        document.getElementById("hud").style.display = "none";

        alert("Vous avez tuée tout les ennemy gg !")
    }
    //Remettre les pv a 0 lors de la fin du combat ?
}

var deathone = false;

function death(string) {
    if (deathone == false) {
        deathone = true;
        alert(string)
        window.location.reload();
    }
}

function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

var notexecutebl = false; // variable pour que on ne puisse pas faire la collision de mainennemy plusieurs fois

//Boucle qui s'exécute pour la physique/position
function animate() {
    requestAnimationFrame(animate);

    // Update Oimo.js
    world.step();


    // Si on tombe avec le joueurs
    if ((body1).getPosition().y < -5) {
        body1.position.set(0, -4, 0);
        death("Votre personnage est tombée");
    }


    // Update le player 1(cube1)
    cube1.position.copy(body1.getPosition());
    cube1.quaternion.copy(body1.getQuaternion());

    if (ennemymain[0]) {
        ennemymain[0].cube.position.copy(ennemymain[0].body.getPosition());
        ennemymain[0].cube.quaternion.copy(ennemymain[0].body.getQuaternion());
    }

    // Lancer uniquement si la taille de l'array des dès est pas a 0
    if (dice.length !== 0) {

        dice.forEach(async (el) => {
            let body = el.body;
            let cube = el.cube;

            cube.position.copy(body.getPosition());
            cube.quaternion.copy(body.getQuaternion());

            if (body.sleeping || el.rebond == maxrebonddice) {
                // Réinitialisez la rotation uniquement si le dé est en train de bouger
                if (cube.rotation.x > 0.01) {
                    cube.rotation.x -= 0.01;
                } else if (cube.rotation.x < 0.01) {
                    cube.rotation.x += 0.01;
                }
                if (cube.rotation.y > 0.01) {
                    cube.rotation.y -= 0.01;
                } else if (cube.rotation.y < 0.01) {
                    cube.rotation.y += 0.01;
                }
                if (cube.rotation.z > 0.01) {
                    cube.rotation.z -= 0.01;
                } else if (cube.rotation.z < 0.01) {
                    cube.rotation.z += 0.01;
                }
            } else {

                cube.rotation.x += el.rotation.x;
                cube.rotation.y += el.rotation.y;
                cube.rotation.z += el.rotation.z;

                el.rotation.x -= 0.1;
                el.rotation.y -= 0.1;
                el.rotation.z -= 0.1;

                if (cube.position.y <= -4 && el.rebond != maxrebonddice) {
                    el.rebond += 1
                    let fo = el.force;
                    var force;
                    force = new OIMO.Vec3(fo.x, fo.y, fo.z);
                    var impulsePoint = new OIMO.Vec3(cube.position.x, cube.position.y, cube.position.z);
                    body.applyImpulse(impulsePoint, force);
                    fo.y -= 0.2;
                }
            }
        })
    }

    // Check la collision entre cube1 et ennemycube1
    if (ennemymain != [] && ennemymain[0]) {

        let distance = cube1.position.distanceTo(ennemymain[0].cube.position);

        // La distance minimale à partir de laquelle vous considérerez qu'il y a une collision
        let minDistance = (cube1.geometry.parameters.width / 2) + (ennemymain[0].cube.geometry.parameters.width / 2);

        if (distance <= minDistance) {
            // Collision détectée entre cube1 et cube2
            // Faites quelque chose en réponse à la collision ici.
            if (!notexecutebl) {
                notexecutebl = true;
                moveplayer = false;
                console.log("Distance Ennnemy0", ennemymain)
                startHud();
                kill(ennemymain[0])
                ennemymain.splice(0, 1);
                ennemyinterval();
            }

        }
    }



    // Update Three.js
    renderer.render(scene, camera);
}

// Pour kill un object
function kill(el) {
    return new Promise((resolve) => {
        try {
            // Supprimez le cube Three.js
            scene.remove(el.cube);

            // Supprimez le corps physique Oimo.js
            world.removeRigidBody(el.body);
            resolve()
            // if (!scene.getObjectById(el.cube.id)) {
            //     resolve()
            // } else {
            //     kill(el)
            // }

        } catch (e) {
            console.warn(e)
        }
    })
}

function startHud() {
    let ud = document.getElementById("hud")

    if (ud.style.display == "none") {
        ud.style.display = "block";
    } else {
        ud.style.display = "none";
    }
}

//Fait démarrer le jeu avec le button
async function initstart() {
    console.log("La 3D du jeu va démarrer !")

    onWindowResize(); //Resize du jeu

    await createcharacter(); // Création des personnage hud && dans le array
    await createennemy(); // Création ennemy

    init(); // Initialisiation du jeu
    createMainEnnemy(-10, -4, 0)
    animate(); //Animation et gestion de physique(boucle du jeu)

}

// Tout les addEventListener !

//Formulaire du début du jeu !
const form = document.getElementById("startgameform");
form.addEventListener("submit", function (e) {
    e.preventDefault()

    const formdata = new FormData(form);
    const data = Object.fromEntries(formdata.entries());
    let jso = JSON.parse(JSON.stringify(data));
    choicy = jso;
    if (jso.classe1 && jso.classe2 && jso.classe3 && jso.classe4 && jso.classe5 &&
        jso.difficulty && jso.bonus1 && jso.bonus2) {
        form.style.display = "none"
        // document.getElementById("hud").style.display = ""
        setTimeout(function () {
            // Créez un gestionnaire d'événements pour les clics sur la scène
            //Init le jeu 3D
            initstart()
        }, 200)

    } else {
        alert("Veuillez tout remplir !")
    }

})

window.addEventListener('resize', onWindowResize, false); //Permet de rezize le jeu !

window.addEventListener('click', onMouseClick, false); // Permet de savoir sur lequel cliquer

function onWindowResize() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function findCharacter(name) {

    return character.find(d => d.name == name);

}

function addDiceAlly(item) {
    let dice = item[0]
    let quoi = dice.face[dice.facerand];
    document.getElementById(`titreclasse${item[1].index}`).lastElementChild.lastElementChild.innerText = `${quoi}`;
    item[1].choiceface = quoi;

}

var clikdice = 0;

//Détecter le click sur un dès pour
async function onMouseClick(event) {
    try {
        // Récupérez les coordonnées du clic par rapport à la fenêtre
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Créez un rayon depuis la caméra à travers le point du clic
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Trouvez les objets intersectés par le rayon
        const intersects = raycaster.intersectObjects(dice.map(d => d.cube));

        // Si des objets ont été intersectés
        if (intersects.length > 0) {
            const intersectedCube = intersects[0].object;

            // Recherchez le cube correspondant dans votre tableau dice
            const diceItem = dice.find(d => d.cube === intersectedCube);

            // Si le cube est en mode "sleeping", faites quelque chose
            if (diceItem && diceItem.body.sleeping) {
                // Exécutez votre code pour le clic sur un cube dormant ici

                if (!diceItem.clicked) {
                    console.log('Cube dormant cliqué !');

                    clikdice++;
                    diceItem.clicked = true;

                    addDiceAlly([diceItem, findCharacter(diceItem.name)]); // On lui passe le cube[0] et le personnage[1]

                }

                if (clikdice == dice.length) {
                    affichageInfo("Les ennemy attaque en premier !"); // On dit au joueurs

                    await killAllDice(); // Désaficher tout dès !
                    createBtnAtk() //Création des button pour attaquer
                }

            }
        }
    } catch (e) {
        console.warn(e)
    }

}

function choicingAlly(ch, el) {
    return new Promise((resolve) => {

        console.log(`Vous avez choisi ${el.name} Ton personnage fait ${ch.dmg} de dégat\nValeur ? ${choiceennemyforally}`)
        if (ch.whofight == "") {
            choiceennemyforally--;

            ch.whofight = el.name;
            document.getElementById(`titreclasse${ch.index}`).lastElementChild.style = `border: 5px dashed ${el.color}`

            document.getElementById(`titreclasse${ch.index}`).getElementsByClassName("card-text")[0].innerHTML = `${ch.choiceface} -> <b>${el.name} = ${ch.dmg}</b> `;
        }


        resolve();
    });

}

function btnfight(bool) {
    let b = document.getElementById("btninfotop").style;
    if (b.display == "none") {
        b.display = "block"; // Btn t'attaque que on affiche
    } else {
        b.display = "none"; // Btn t'attaque que on affiche
    }

}

function delBtnAtk() {
    let at = document.getElementsByClassName("atkally");
    for (let i = at.length - 1; i >= 0; i--) {
        at[i].remove();
    }

}

var choiceennemyforally = 0;

function createBtnAtk() {
    character.forEach((ch, ic) => {
        ennemy.forEach((el, i) => {
            if (ch.choiceface != "nop") {
                choiceennemyforally++;

                let tcb = document.getElementById(`titreclasse${ic + 1}`).getElementsByClassName("card-btn")[0];
                let btn = document.createElement("button")
                btn.innerText = el.name;
                btn.classList.add("atkally")

                let onButtonClick = async function () {
                    await choicingAlly(ch, el);

                    if (choiceennemyforally === 0) {
                        btnfight();
                    }
                };

                btn.addEventListener("click", onButtonClick);
                tcb.appendChild(btn);
            }
        });
    });
}



// Qui il tape et combien de dégat il fait !
function startEnnemyFight() {
    clikdice = 0; //Reset du nombre de truc cliqued
    console.log("[ENNEMY] Démarrage du fight !")
    // console.log("Ennemy", ennemy);
    // console.log("Character", character);
    affichageInfo(`Les ennemy va maintenant attaquer`)

    ennemy.forEach((el, i) => {
        if (el.choiceface != "nop") {
            //Remove le visuel pour qui tape l'ennemy
            document.getElementById(`titreennemy${i}`).lastElementChild.style = `border: none` //Enlever la bordure lorsque il fight
            document.getElementById(`titreennemy${i}`).getElementsByClassName("card-text")[0].innerText = "?";

            let ch = character.find(d => d.name == el.fight);
            changeally("", ch.index, (ch.pv - el.dmg))
        }
    })
    setTimeout(function () {

        //Vérification de si il sont pas mort tous !
        if (character.length == 0) {
            death();
        }

        startAllyFight();

    }, timeTour)

}

// Qui il tape et combien de dégat il fait !
function startAllyFight() {
    clikdice = 0; //Reset du nombre de truc cliqued
    console.log("[ALLY] Démarrage du fight !")
    affichageInfo(`Les alliées va maintenant attaquer`)

    character.forEach(async (ch, i) => {
        let tc = document.getElementById(`titreclasse${ch.index}`); // Get element by id avec l'index du character

        tc.getElementsByClassName("card-text")[0].innerText = "?"; // Remove le texte écrit

        if (ch.choiceface != "nop" && ennemy.length != 0) { // Fait si il a un ennemy et que il n'est pas tombée sur la face nop
            tc.lastElementChild.style = `border: none` //Remove la border

            let el = ennemy.find(d => d.name == ch.whofight);
            await changeEnnemy(ennemy.indexOf(el), (el.pv - ch.dmg))
            ch.whofight = "";

        }
    })

    setTimeout(function () {
        if (ennemy.length == 0) {
            affichageInfo("Fin du fight !");
            deathEnnemy();
        } else {
            affichageInfo(`Prochain tour enclanchée !`)

            ennemyinterval();
        }


    }, timeTour)


}




//Gestion de bouger le personnage principal "cube1" & "body1"
document.addEventListener("keydown", (e) => {
    console.log(e.key)

    if (moveplayer) { // Variable qui dit oui ou nom l'utulisateur peut bouger.
        switch (e.key) {
            case "z":
                body1.linearVelocity.set(0, 0, -5);
                break;
            case "s":
                body1.linearVelocity.set(0, 0, 5);
                break;
            case "q":
                body1.linearVelocity.set(-5, 0, 0);
                break;
            case "d":
                body1.linearVelocity.set(5, 0, 0);
                break;

        }
    }

    //La camera :
    switch (e.key) {
        case "ArrowLeft":
            camera.position.x -= 1;
            break;
        case "ArrowRight":
            camera.position.x += 1;
            break;
        case "ArrowDown":
            camera.position.z += 1;
            break;
        case "ArrowUp":
            camera.position.z -= 1;
            break;
    }

});





window.onload = function () {
    // Créez un élément de bouton HTML
    const button = document.createElement("button");
    button.innerHTML = "Start Fight";
    button.id = "btninfotop"
    button.style.display = "none"
    button.style.top = "10px";
    button.style.left = "10px";

    // Ajoutez le bouton au DOM
    document.getElementById("divinfotop").appendChild(button);

    // Définissez une action pour le bouton lorsqu'il est cliqué
    button.addEventListener("click", function () {
        // Code à exécuter lorsque le bouton est cliqué, par exemple, pour démarrer le combat.
        btnfight();
        delBtnAtk();
        startEnnemyFight();

    });

}