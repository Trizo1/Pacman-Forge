import { FRONT_LEVEL, OBJECT_TYPE, CELL_SIZE } from './setup';

export function initGame() {
    console.log(5);
    console.log(FRONT_LEVEL);
    console.log(OBJECT_TYPE);
    console.log(CELL_SIZE);

    //drawFrontFace();
}

function drawFrontFace() {

}














let sphere;
let box, box1, box2, box3, box4, box5, box6, box7, box8, box9, box10, box11, box12, box13, box14, box15, box16, box17;
let keysQ = [];
var direction = new THREE.Vector3(0, 1, 0);
let reycaster;

let intersects;

var mesh = [];

function createPacman() {
    const pacman = new THREE.SphereGeometry(10, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const wall1 = new THREE.BoxGeometry(10, 260, 10);
    const wall2 = new THREE.BoxGeometry(10, 10, 310);
    const wall3 = new THREE.BoxGeometry(10, 250, 10);
    const wall4 = new THREE.BoxGeometry(10, 10, 310);
    const wall5 = new THREE.BoxGeometry(10, 250, 10);
    const wall6 = new THREE.BoxGeometry(10, 10, 50);
    const wall7 = new THREE.BoxGeometry(10, 10, 100);
    const wall8 = new THREE.BoxGeometry(10, 50, 10);
    const wall9 = new THREE.BoxGeometry(10, 100, 10);
    const wall10 = new THREE.BoxGeometry(10, 10, 50);
    const wall11 = new THREE.BoxGeometry(10, 100, 10);
    const wall12 = new THREE.BoxGeometry(10, 10, 150);
    const wallmaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    box = new THREE.Mesh(wall1, wallmaterial);
    box1 = new THREE.Mesh(wall2, wallmaterial);
    box2 = new THREE.Mesh(wall3, wallmaterial);
    box3 = new THREE.Mesh(wall4, wallmaterial);
    box4 = new THREE.Mesh(wall5, wallmaterial);
    box5 = new THREE.Mesh(wall6, wallmaterial);
    box6 = new THREE.Mesh(wall7, wallmaterial);
    box7 = new THREE.Mesh(wall8, wallmaterial);
    box8 = new THREE.Mesh(wall9, wallmaterial);
    box9 = new THREE.Mesh(wall10, wallmaterial);
    box10 = new THREE.Mesh(wall11, wallmaterial);
    box11 = new THREE.Mesh(wall8, wallmaterial);
    box12 = new THREE.Mesh(wall10, wallmaterial);
    box13 = new THREE.Mesh(wall12, wallmaterial);
    sphere = new THREE.Mesh(pacman, material);
    box.position.set(155, -25, 145);
    box1.position.set(155, 150, -5);
    box2.position.set(155, 20, -155);
    box3.position.set(155, -150, -5);
    box4.position.set(155, 30, 100);
    box5.position.set(155, 25, 75);
    box6.position.set(155, -90, 50);
    box7.position.set(155, -60, 50);
    box8.position.set(155, -100, -50);
    box9.position.set(155, -55, -75);
    box10.position.set(155, -55, -100);
    box11.position.set(155, 125, -50);
    box12.position.set(155, 105, -80);
    box13.position.set(155, 50, -75);
    sphere.position.set(160, 125, 130);
    if (!NOP_VIEWER.overlays.hasScene('custom-scene')) {
        NOP_VIEWER.overlays.addScene('custom-scene');
    }

    NOP_VIEWER.overlays.addMesh(sphere, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box1, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box2, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box3, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box4, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box5, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box6, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box7, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box8, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box9, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box10, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box11, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box12, 'custom-scene');
    NOP_VIEWER.overlays.addMesh(box13, 'custom-scene');

    mesh.push(box);
    mesh.push(box1);
    mesh.push(box2);
    mesh.push(box3);
    mesh.push(box4);
    mesh.push(box5);
    mesh.push(box6);
    mesh.push(box7);
    mesh.push(box8);
    mesh.push(box9);
    mesh.push(box10);
    mesh.push(box11);
    mesh.push(box12);
    mesh.push(box13);


    move();
}

document.addEventListener('keydown', checkInput);

function checkInput(e) {
    switch (e.keyCode) {

        case 65:
            //sphere.position.add(new THREE.Vector3(0, 0, 1));
            keysQ.push(new THREE.Vector3(0, 0, 1));
            break;

        case 68:
            //snake[0].position.add(new THREE.Vector3(0, 0, -1));
            keysQ.push(new THREE.Vector3(0, 0, -1));
            break;

        case 87:
            //snake[0].position.add(new THREE.Vector3(0, 1, 0));
            keysQ.push(new THREE.Vector3(0, 1, 0));
            break;

        case 83:
            //snake[0].position.add(new THREE.Vector3(0, -1, 0));
            keysQ.push(new THREE.Vector3(0, -1, 0));
            break;
    }
}

function move() {
    requestAnimationFrame(move);
    viewer.impl.sceneUpdated(true);

    if (sphere == undefined)
        return;

    let dir = new THREE.Vector3(direction.x, direction.y, direction.z);

    reycaster = new THREE.Raycaster(sphere.position, dir, 0, 15);

    intersects = reycaster.intersectObjects(mesh);


    direction = keysQ.length > 0 ? keysQ.pop(0) : direction;
    if (intersects.length == 0) {
        if (sphere != undefined) {
            var newPosition = new THREE.Vector3(sphere.position.x + direction.x * 0.7,
                sphere.position.y + direction.y * 0.7,
                sphere.position.z + direction.z * 0.7);
            reycaster.set(newPosition, dir);
        }

        sphere.position.set(newPosition.x, newPosition.y, newPosition.z);
    }


    console.log(intersects);

}