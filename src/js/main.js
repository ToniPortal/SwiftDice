const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const groundGeometry = new THREE.PlaneGeometry(10, 10);
// const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const ground = new THREE.Mesh(groundGeometry, groundMaterial);
// ground.rotation.x = -Math.PI / 2;
// scene.add(ground);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.y = 10;

const cube2 = new THREE.Mesh(geometry, material);
scene.add(cube2);
cube2.position.y = 14

// createcube();


function createboxcoli() {

}

document.addEventListener("keydown", (e) => {
    console.log(e.key)
    console.log(camera.position.z)
    if (cube.position.y != -10.099999999999962) {
        switch (e.key) {
            case "z":
                camera.position.z -= 0.5;
                break;
            case "s":
                camera.position.z += 0.5;
                break;
            case "q":
                cube.position.x -= 1;
                break;
            case "d":
                cube.position.x += 1;
                break;
        }
    }
});

const boundingBox1 = new THREE.Box3(); // Boîte englobante pour le premier cube
const boundingBox2 = new THREE.Box3(); // Boîte englobante pour le deuxième cube
boundingBox1.setFromObject(cube);
boundingBox2.setFromObject(cube2);

var cubestop = true
var cubestop2 = true


function animate() {
    requestAnimationFrame(animate);

    // Vérifiez la collision entre les deux boîtes englobantes
    if (boundingBox1.intersectsBox(boundingBox2)) {
        // Collision détectée entre cube1 et cube2
        // Vous pouvez ajouter ici le code de gestion de la collision
        cubestop = false;
        cubestop2 = false;
    }

    if (cube.position.y > -10 && cubestop == true) {
        cube.position.y -= 0.1;
        boundingBox1.setFromObject(cube);
    }
    // console.log(cube.position)
    if (cube2.position.y > -10 && cubestop2 == true) {
        cube2.position.y -= 0.1;
        boundingBox2.setFromObject(cube2);
    }
    renderer.render(scene, camera);
}

animate();