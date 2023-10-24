var scene, camera, renderer,
    world, body1, body2, bodymulti, groundBody, groundBody1,
    cube1, cube2, cubemulti, ground, ground1,
    allcube = [],
    score = 0,
    grav = 0,
    nbcube = 0;

//Multijoueurs :
const socket = io("http://localhost:5941");

socket.on("connect_error", () => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});

// client-side
socket.on("connect", () => {
    const engine = socket.io.engine;

    engine.on("upgrade", () => {
        const upgradedTransport = socket.io.engine.transport.name; // in most cases, "websocket"
        console.log(upgradedTransport)
    });
});


function onWindowResize() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

async function updateGravity(x, y, z) {
    try {
        await world.gravity.set(x, y, z);

        await Promise.all(allcube.map(async (el) => {
            await el.body.gravity.set(x, y, z);
        }));
    } catch (e) {
        console.warn(e)
    }

}



function init() {
    // Three.js setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    world = new OIMO.World({
        info: true,
        random: true,  // randomize sample
        gravity: [0, -20, 0]
    });

    // Create ground
    var groundSize = [5, 1, 5]; // Adjust the size as needed
    var groundPosition = [0, -5, 0]; // Position it slightly below the center
    groundBody = world.add({
        type: 'box',
        size: groundSize,
        pos: groundPosition,
        move: false // Set the ground as static
    });

    // Create ground1
    var groundSize1 = [5, 1, 5]; // Adjust the size as needed
    var groundPosition1 = [0, 6, 0]; // Position it slightly below the center
    groundBody1 = world.add({
        type: 'box',
        size: groundSize1,
        pos: groundPosition1,
        move: false // Set the ground as static
    });

    // Create cube 1
    var size1 = [1, 1, 1];
    var position1 = [0, -4, 0];
    body1 = world.add({
        type: 'box',
        size: size1,
        pos: position1,
        move: true
    });

    // Create cube du multiplayer
    var sizemulti = [1, 1, 1];
    var positionmulti = [0, -4, 0];
    bodymulti = world.add({
        type: 'box',
        size: sizemulti,
        pos: positionmulti,
        move: true
    });

    // Create ground geometry and material for Three.js
    var groundGeometry = new THREE.BoxGeometry(groundSize[0], groundSize[1], groundSize[2]);
    var groundMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    // Create ground mesh
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(groundPosition[0], groundPosition[1], groundPosition[2]);
    scene.add(ground);


    ground1 = new THREE.Mesh(groundGeometry, groundMaterial);
    ground1.position.set(groundPosition1[0], groundPosition1[1], groundPosition1[2]);
    scene.add(ground1);

    // Create cube geometry and material for Three.js
    var geometry = new THREE.BoxGeometry(size1[0], size1[1], size1[2]);

    // Create cube 1 mesh
    cube1 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x030AF0 }));
    cube1.position.set(position1[0], position1[1], position1[2]);
    scene.add(cube1);

    cubemulti = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x23F003 }));
    cubemulti.position.set(positionmulti[0], positionmulti[1], positionmulti[2]);
    scene.add(cubemulti);

    setInterval((e) => {
        if (allcube.length < nbcube) {
            createcube()
        }
    }, 1000)

    function createcube() {
        // Create cube 2
        let size2 = [1, 1, 1];
        let position2 = [0, 5, 0];
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

        allcube.push({ body: body2, cube: cube2 })
    }



    // receive a message from the server
    socket.on("xyz", (all) => {
        console.log("XYZ", all)
        bodymulti.position.set(all.x, all.y, all.z);
        // bodymulti.linearVelocity.set(all.x, all.y, all.z);

    });

}
const hscore = document.getElementById("score");

setInterval(function () {
    socket.emit("servgame", body1.getPosition())

}, 50)

function animate() {
    requestAnimationFrame(animate);

    //Multiplayer

    // Update Oimo.js
    world.step();

    // Update Three.js
    cube1.position.copy(body1.getPosition());
    cube1.quaternion.copy(body1.getQuaternion());

    //Cube Multi
    cubemulti.position.copy(bodymulti.getPosition());
    cubemulti.quaternion.copy(bodymulti.getQuaternion());

    if (grav === 0) {
        if ((body1).getPosition().y < -5) {
            body1.position.set(0, -4, 0);
            alert("Vous êtes mort !")
            window.location.reload();
            // allcube.slice(0,allcube.length);
            // score = 0;
            // hscore.innerText = 0;

        }
    } else {
        if ((body1).getPosition().y > 6) {
            body1.position.set(0, -4, 0);
            alert("Vous êtes mort !")
            window.location.reload();
            // allcube.slice(0,allcube.length);
            // score = 0;
            // hscore.innerText = 0;

        }
    }
    //Spawn de cube !
    allcube.forEach(async (el) => {
        (el.cube).position.copy((el.body).getPosition());
        (el.cube).quaternion.copy((el.body).getQuaternion());
        if (grav === 0) {
            if ((el.body).getPosition().y < -5) {
                kill(el);
            }
        } else {
            if ((el.body).getPosition().y > 6) {
                kill(el);
            }
        }

    })

    // Update Three.js
    renderer.render(scene, camera);
}

function kill(el) {
    world.remove(el.body); // Remove the Oimo.js body
    scene.remove(el.cube); // Remove the Three.js cube
    el.cube.geometry.dispose(); // Dispose of the geometry
    el.cube.material.dispose(); // Dispose of the material

    const index = allcube.indexOf(el);
    if (index !== -1) {
        score++;
        allcube.splice(index, 1);
        hscore.innerText = score
    }
}

document.addEventListener("keydown", (e) => {
    console.log(e.key)
    // console.log(cube1.position.x)
    switch (e.key) {
        case "z":
            body1.linearVelocity.set(0, 0, -3);
            break;
        case "s":
            body1.linearVelocity.set(0, 0, 3);

            break;
        case "q":
            body1.linearVelocity.set(-3, 0, 0);
            break;
        case "d":
            body1.linearVelocity.set(3, 0, 0);
            break;
        case "k":
            grav = 1;
            updateGravity(0, 20, 0)
            break;
    }
});

window.addEventListener('resize', onWindowResize, false);


onWindowResize()
init();
animate();



