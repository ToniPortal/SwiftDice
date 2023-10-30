window.onload = function () {

    var scene, camera, renderer, // la camera et la scene
        world, body1, body2, groundBody, groundLayer = 1, //Le sol et les corps de physique
        cube1, ground, // Les joueurs 1 cube
        dice = [], maxrebonddice = 3, // Les lancée de dès
        character = [], //Correspond au variable des personnage
        ennemy = [], choicy; //Coresspond au variable de l'ennemy

    function onWindowResize() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    }

    async function updateGravity(x, y, z) {
        try {
            await world.gravity.set(x, y, z);

            // await Promise.all(allcube.map(async (el) => {
            //     await el.body.gravity.set(x, y, z);
            // }));
        } catch (e) {
            console.warn(e)
        }

    }



    function init() {
        // Three.js setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 10, 30); // Position de la caméra
        camera.lookAt(0, 0, 0); // Point de regard de la caméra


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

        // Create cube 1 mesh
        cube1 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x030AF0 }));
        cube1.position.set(position1[0], position1[1], position1[2]);
        scene.add(cube1);

        //Start les dès pour l'ennemy
        ennemyinterval(ennemy.length);

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
            let material2 = new THREE.MeshBasicMaterial({ color: 0xF02003 }); // NE PAS OUBLIER CHANGER couleur pour pas se perdre
            let cube2 = new THREE.Mesh(geometry, material2);
            cube2.position.set(position2[0], position2[1], position2[2]);
            scene.add(cube2);

            if (allye) {
                dice.push({ cube: cube2, body: body2, name: character[bl].name, face: character[bl].face, rebond: 0, ally: allye, force: { x: rand(-3, 3), y: rand(6, 10), z: rand(-3, 3) }, rotation: { x: 5, y: 5, z: 5 } });
            } else {
                dice.push({ cube: cube2, body: body2, name: ennemynames[bl].name, face: ennemynames[bl].face, rebond: 0, ally: allye, force: { x: rand(-3, 3), y: rand(6, 10), z: rand(-3, 3) }, rotation: { x: 5, y: 5, z: 5 } });
            }
        }

        var allyinter;

        function allyinterval() {
            console.log(dice + "; Création de dès alliés !")
            let x = 0
            let bl = 0
            allyinter = setInterval((e) => {
                if (dice.length < 5) {
                    createdice(true, bl, x, 5, 0);
                    x += 0.2;
                } else {
                    clearInterval(allyinter) //Finir les lancer des dès
                    //Ally Commencer a dire qui il va attaquer et les attaquer.
                }
                bl++;
            }, 1000);
        }

        var ennemyinter;

        function ennemyinterval(nbmaxdice) {
            let bl = 0;
            ennemyinter = setInterval((e) => {
                if (dice.length < nbmaxdice) {
                    createdice(false, bl, 0, 5, 0);
                } else {
                    clearInterval(ennemyinter) //Finir les lancer des dès

                    //Ennemy Commencer a dire qui il va attaquer et les attaquer.
                    setTimeout(async function () {
                        await choicingennemy(); //Lancer le choix
                        //Lancer l'alliée !
                        setTimeout(function () {
                            dice.forEach((di) => {
                                kill(di) //Kill et delete l'array des dès
                            })
                            // setTimeout(async function () {

                                allyinterval()
                            // },1000)
                        }, 3000)
                    }, 500)
                }
                bl++;
            }, 1000);
        }



    }

    var allyname = [];

    function choicingennemy() {
        //Les ennemy choissie quel il vont taper 
        return new Promise((resolve) => {

            ennemy.forEach((el, i) => {
                let rande = rand(0, 5);
                let qui = character[rande];
                if (qui) {
                    document.getElementById(`titreennemy${i + 1}`).lastElementChild.style = `border: 2px dashed ${qui.color}`
                    document.getElementById(`titreennemy${i + 1}`).getElementsByTagName("b")[0].innerText = qui.name;
                }
            })
            resolve();

        })

    };

    function createcharacter() {
        return new Promise((resolve) => {

            let i = 1;
            while (i < 6) {

                let selectElement = document.querySelector(`select[name="classe${i}"]`);
                let selectedOption = selectElement.options[selectElement.selectedIndex];
                let vname = selectedOption.text;
                allyname.push(vname);

                let vpv;
                let vcolor;
                switch (vname) {
                    case "Voleur":
                        vpv = 4
                        vcolor = "orange"
                        break;
                    case "Gardien":
                        vpv = 7
                        vcolor = "gray"
                        break;
                    case "Combattant":
                        vpv = 5
                        vcolor = "green"
                        break;
                    case "Healer":
                        vpv = 5;
                        vcolor = "red"
                        break;
                    case "Mage":
                        vpv = 4;
                        vcolor = "blue"
                        break;
                }
                character.push({ name: vname, pv: vpv, maxpv: vpv, color: vcolor })
                changeally(vname, i, vpv)

                if (i == 5) {
                    resolve() //Lorsque que on est dernier paf dit que on a fini
                }
                i++;
            }
        });
    }

    var ennemynames = [{ name: "Nullos", face: ["", "atk", "", "", "atk", "atk"] },
    { name: "PafLechien", face: ["", "", "atk", "atk", "atk", "atk"] }];

    function createennemy() {
        return new Promise((resolve) => {

            document.getElementById("ennemydiv").style = `position: relative;bottom: 460px;left: ${window.innerWidth / 1.19}px;`

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


            let bl = 1;
            while (bl < nbennemy + 1) {
                let randname = ennemynames[rand(0, ennemynames.length - 1)].name;
                ennemy.push({ name: randname, pv: vpv, maxpv: vpv })
                document.getElementById("ennemydiv").innerHTML += `<div class="col ms-auto">
        <div id="titreennemy${bl}" class="card wd-50 rounded-0" style="width: 15%">
            <h5 class="card-header">${randname}</h5>
            <div class="card-body">
                <div class="progress" role="progressbar" aria-valuenow="${vpv}"
                    aria-valuemin="0" aria-valuemax="${vpv}">
                    <div class="progress-bar bg-red" style="width: 100%">${vpv}/${vpv}</div>
                </div>
                <p class="card-text">hit <b>?</b></p>
            </div>
        </div>
        </div>`

                if (bl == nbennemy) {
                    resolve()
                }

                bl++;
            }

        });

    }


    function changeally(name, nb, vpv) {
        let t = document.getElementById(`titreclasse${nb}`);

        // Set les valeur de la barre de progression
        t.lastElementChild.firstElementChild.setAttribute("aria-valuenow", vpv)
        t.lastElementChild.firstElementChild.setAttribute("aria-valuemax", vpv)

        t.lastElementChild.firstElementChild.lastElementChild.innerText = `${vpv}/${character[nb - 1].maxpv}`
        t.lastElementChild.firstElementChild.lastElementChild.style = `width: ${(vpv / character[nb - 1].maxpv) * 100}%`;

        // Changer le nom
        if (name != "") {
            t.firstElementChild.innerText = name;
        }

        //Création du truc pour le dès
        // let p = document.getElementsByTagName("p")[0]
        // p.innerText = "--"
        // p.classList.add("cart-text")
        // p.style = "margin: 0;"
        // t.lastElementChild.appendChild(p)


    }

    function rand(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }

    function animate() {
        requestAnimationFrame(animate);

        // Update Oimo.js
        world.step();

        // Update Three.js
        cube1.position.copy(body1.getPosition());
        cube1.quaternion.copy(body1.getQuaternion());

        if ((body1).getPosition().y < -5) {
            body1.position.set(0, -4, 0);
            alert("Vous êtes mort !")
            window.location.reload();
        }

        // Vérifiez si tous les dés ont atterri
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

        // Update Three.js
        renderer.render(scene, camera);
    }

    // Pour kill un object
    function kill(el) {
        world.remove(el.body); // Remove the Oimo.js body
        scene.remove(el.cube); // Remove the Three.js cube
        el.cube.geometry.dispose(); // Dispose of the geometry
        el.cube.material.dispose(); // Dispose of the material

        const index = dice.indexOf(el);
        if (index !== -1) {
            dice.splice(index, 1);
        }
    }

    window.addEventListener('resize', onWindowResize, false);

    async function initstart() {
        console.log("La 3D du jeu va démarrer !")

        onWindowResize(); //Resize du jeu

        await createcharacter(); // Création des personnage hud && dans le array
        await createennemy(); // Création ennemy

        init(); // Initialisiation du jeu
        animate(); //Animation et gestion de physique(boucle du jeu)

    }


    function onMouseClick(event) {
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
                console.log('Cube dormant cliqué !');
            }
        }
    }


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
            document.getElementById("hud").style.display = ""
            setTimeout(function () {
                // Créez un gestionnaire d'événements pour les clics sur la scène
                window.addEventListener('click', onMouseClick, false);
                //Init le jeu 3D
                initstart()
            }, 200)

        } else {
            alert("Veuillez tout remplir !")
        }

    })
}

