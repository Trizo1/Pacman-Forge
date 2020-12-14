import { FRONT_LEVEL, OBJECT_TYPE, CELL_SIZE, DEPTH, CUBE_SIZE } from './setup.js';

let mesh = [];
export function initGame() {
    drawFrontFace();
    NOP_VIEWER.impl.invalidate(true);
}

function drawFrontFace() {
    if (!NOP_VIEWER.overlays.hasScene('custom-scene')) {
        NOP_VIEWER.overlays.addScene('custom-scene');
    }
    const wallmaterial = new THREE.MeshBasicMaterial({ color: '#0033CC' });
    for (let i = 0; i < 34; i++) {
        for (let j = 0; j < 34; j++) {
            if (FRONT_LEVEL[i][j] == 1) {
                const wall = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, DEPTH);
                let box = new THREE.Mesh(wall, wallmaterial);
                box.position.set(j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), CUBE_SIZE + DEPTH / 2);
                NOP_VIEWER.overlays.addMesh(box, 'custom-scene');
                mesh.push(box);
            }
        }
    }
}

let sphere;
let keysQ = [];
var direction = new THREE.Vector3(0, 1, 0);
let reycaster;

let intersects;

function createPacman() {
    move();
}
//document.addEventListener('keydown', checkInput);

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
}