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

    let checkedCells = [];
    for (let i = 0; i < 34; i++) {
        checkedCells[i] = [];
    }

    const wallmaterial = new THREE.MeshBasicMaterial({ color: '#0033CC' });

    let tempFigure = [];

    for (let i = 0; i < 34; i++) {
        for (let j = 0; j < 34; j++) {
            if (FRONT_LEVEL[i][j] == 2 && FRONT_LEVEL[i][j] != checkedCells[i][j]) {

                checkedCells[i][j] = 2;

                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE), y: -i * CELL_SIZE + CUBE_SIZE }); // left top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -i * CELL_SIZE + CUBE_SIZE }); // right top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -i * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // right bottom
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE), y: -i * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // left bottom

                follow('left', i, j, tempFigure, checkedCells);
                follow('right', i, j, tempFigure, checkedCells);
                // follow('down', i, j, tempFigure, checkedCells);

                let figure = truncateFigure(tempFigure);
                console.log(tempFigure);
                tempFigure = [];
                console.log(figure.length);
                break;
                // const wall = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, DEPTH);
                // let box = new THREE.Mesh(wall, wallmaterial);
                // box.position.set(j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), CUBE_SIZE + DEPTH / 2);
                // NOP_VIEWER.overlays.addMesh(box, 'custom-scene');
                // mesh.push(box);

            }
        }
    }
    // console.log(checkedCells);
}

function truncateFigure(tempFigure) {
    let figure = [];
    for (let i = 0; i < tempFigure.length; i++) {
        if (!tempFigure.includes({ x: tempFigure[i].x, y: tempFigure[i].y + CELL_SIZE }) ||
            !tempFigure.includes({ x: tempFigure[i].x, y: tempFigure[i].y - CELL_SIZE }) ||
            !tempFigure.includes({ x: tempFigure[i].x + CELL_SIZE, y: tempFigure[i].y }) ||
            !tempFigure.includes({ x: tempFigure[i].x - CELL_SIZE, y: tempFigure[i].y })) {
            figure.push(tempFigure[i]);
        }
    }
    return figure;
}


function follow(type, i, j, tempFigure, checkedCells) {
    if (FRONT_LEVEL[i][j] != 0) {
        if (type == "right") {
            if (FRONT_LEVEL[i][j + 1] == FRONT_LEVEL[i][j] && FRONT_LEVEL[i][j + 1] != checkedCells[i][j + 1]) {
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE }); // left top
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE }); // right top
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // right bottom
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // left bottom
                checkedCells[i][j + 1] = FRONT_LEVEL[i][j + 1];
                follow("right", i, j + 1, tempFigure, checkedCells);

            }
            else follow("down", i, j, tempFigure, checkedCells);
        }
        if (type == "down") {
            if (FRONT_LEVEL[i + 1][j] == FRONT_LEVEL[i][j] && FRONT_LEVEL[i + 1][j] != checkedCells[i + 1][j]) {
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE), y: -(i + 1) * CELL_SIZE + CUBE_SIZE }); // left top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -(i + 1) * CELL_SIZE + CUBE_SIZE }); // right top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -(i + 1) * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // right bottom
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE), y: -(i + 1) * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // left bottom
                checkedCells[i + 1][j] = FRONT_LEVEL[i + 1][j];
                follow("down", i + 1, j, tempFigure, checkedCells);
                follow('left', i + 1, j, tempFigure, checkedCells);
                follow('right', i + 1, j, tempFigure, checkedCells);

            }
        }
        if (type == "left") {
            if (FRONT_LEVEL[i][j - 1] == FRONT_LEVEL[i][j] && FRONT_LEVEL[i][j - 1] != checkedCells[i][j - 1]) {
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE }); // left top
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE }); // right top
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // right bottom
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE), y: -(i) * CELL_SIZE + CUBE_SIZE - CELL_SIZE }); // left bottom
                checkedCells[i][j - 1] = FRONT_LEVEL[i][j - 1];
                follow("left", i, j - 1, tempFigure, checkedCells);

            }
            else follow("down", i, j, tempFigure, checkedCells);
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


