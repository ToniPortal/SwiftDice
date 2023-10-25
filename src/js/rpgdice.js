var scene, camera, renderer,
    world, body1, body2, groundBody, groundLayer = 1,
    cube1, ground,
    dice = [], nbmaxdice = 5, maxrebonddice = 3;

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

    //Start les dès
    interval();

    function createdice(x, y, z) {
        // Create cube 2
        let size2 = [1, 1, 1];
        let position2 = [x, y, z];
        let body2 = world.add({
            type: 'box',
            size: size2,
            pos: position2,
            move: true
        });
        // Create cube 2 mesh
        let material2 = new THREE.MeshBasicMaterial({ color: 0xF02003 });
        let cube2 = new THREE.Mesh(geometry, material2);
        cube2.position.set(position2[0], position2[1], position2[2]);
        scene.add(cube2);

        dice.push({ cube: cube2, body: body2, face: 0, rebond: 0, force: { x: rand(-3, 3), y: rand(6, 10), z: rand(-3, 3) }, rotation: { x: 5, y: 5, z: 5 } });
    }

    var interdice;

    function interval() {
        let x = 0
        interdice = setInterval((e) => {
            if (dice.length < nbmaxdice) {
                createdice(x, 5, 0);
                x += 0.2;
            } else {
                clearInterval(interdice)
            }
        }, 1000);
    }

}




function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
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

            // if (nbdicesleep == nbmaxdice) {
            //     // dice = [];
            //     let lancerdes = []
            //     await dice.forEach((el) => {
            //         lancerdes.push(el.face)
            //     })
            //     console.log("fin lancer de dès", lancerdes);

            // }
        })
    }

    // Update Three.js
    renderer.render(scene, camera);
}

function showResultsDice() {
    const results = dice.map((cube, index) => {
        const position = cube.position.clone();
        position.y = Math.floor(position.y);
        return `Dé ${index + 1}: (${position.x}, ${position.y}, ${position.z})`;
    });

    console.log("Résultats :");
    results.forEach((result) => console.log(result));
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

function initstart() {
    console.log("La 3D du jeu va démarrer !")

    onWindowResize();
    init();
    animate();
}

// Créez un gestionnaire d'événements pour les clics sur la scène
window.addEventListener('click', onMouseClick, false);

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


window.onload = function () {
    const btn = document.getElementById("startgame");
    btn.addEventListener("submit", function (e) {
        e.preventDefault()
        btn.style.display = "none"
        setTimeout(function(){
            initstart()
        },1000)
        
    })
}

