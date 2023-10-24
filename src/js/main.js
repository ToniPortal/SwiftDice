var scene, camera, renderer;
var world, body1, body2, groundBody;
var cube1, cube2, ground;
var allcube = [];

function onWindowResize() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function init() {
    // Three.js setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;


    // Oimo.js setup
    world = new OIMO.World({ info: true });

    // Create ground
    var groundSize = [5, 1, 5]; // Adjust the size as needed
    var groundPosition = [0, -5, 0]; // Position it slightly below the center
    groundBody = world.add({
        type: 'box',
        size: groundSize,
        pos: groundPosition,
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

    setInterval((e) => {
        createcube()
    },1000)

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

        allcube.push({ body: body2, cube: cube2})
    }


}

function animate() {
    // requestAnimationFrame(animate);

    // Update Oimo.js
    world.step();

    // Update Three.js
    cube1.position.copy(body1.getPosition());
    cube1.quaternion.copy(body1.getQuaternion());

    // cube2.position.copy(body2.getPosition());
    // cube2.quaternion.copy(body2.getQuaternion());
    allcube.forEach((el) => {
        (el.cube).position.copy((el.body).getPosition());
        (el.cube).quaternion.copy((el.body).getQuaternion());
    })

    // Update Three.js
    renderer.render(scene, camera);
}

document.addEventListener("keydown", (e) => {
    console.log(e.key)
    console.log(cube1.position.x)
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
    }
});

window.addEventListener('resize', onWindowResize, false);

onWindowResize()
init();
animate();
