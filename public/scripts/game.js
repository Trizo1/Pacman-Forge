import { FRONT_LEVEL, OBJECT_TYPE, CELL_SIZE, DEPTH, CUBE_SIZE } from './setup.js';
const WALL_SIZE = 5;

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

                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // left top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // right top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // right bottom
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // left bottom

                follow('left', i, j, tempFigure, checkedCells);
                follow('right', i, j, tempFigure, checkedCells);
                // follow('down', i, j, tempFigure, checkedCells);

                let figure = truncateFigure(tempFigure);
                // console.log(tempFigure);
                tempFigure = [];
                // console.log(figure); 
                let shape = drawPath(figure);
                console.log(shape);

                var data = {
                    steps: 1,
                    amount: DEPTH,
                };

                var geometry = new THREE.ExtrudeGeometry(shape, data);
                var wall = new THREE.Mesh(geometry, wallmaterial);
                // break;
                // const wall = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, DEPTH);
                // let wall = new THREE.Mesh(wall, wallmaterial);
                wall.position.set(0, 0, CUBE_SIZE);
                NOP_VIEWER.overlays.addMesh(wall, 'custom-scene');
                // mesh.push(wall);

            }
        }
    }
}

function drawPath(figure) {
    let head = figure[0];
    let shape = new THREE.Shape();
    shape.moveTo(head.x, head.y);
    checkPath(head, figure, shape);
    return shape;
}

function checkPath(head, figure, shape) {
    let topCs = figure.find(item => item.x == head.x && item.y == head.y + (CELL_SIZE - WALL_SIZE));
    let topWs = figure.find(item => item.x == head.x && item.y == head.y + (WALL_SIZE));
    let rightCs = figure.find(item => item.x == head.x + (CELL_SIZE - WALL_SIZE) && item.y == head.y);
    let rightWs = figure.find(item => item.x == head.x + (WALL_SIZE) && item.y == head.y);
    let leftCs = figure.find(item => item.x == head.x - (CELL_SIZE - WALL_SIZE) && item.y == head.y);
    let leftWs = figure.find(item => item.x == head.x - (WALL_SIZE) && item.y == head.y);
    let downCs = figure.find(item => item.x == head.x && item.y == head.y - (CELL_SIZE - WALL_SIZE));
    let downWs = figure.find(item => item.x == head.x && item.y == head.y - (WALL_SIZE));
    if (typeof rightCs != 'undefined') {
        figure.splice(figure.indexOf(rightCs), 1);
        shape.lineTo(rightCs.x, rightCs.y);
        checkPath(rightCs, figure, shape);
    }
    else if (typeof rightWs != 'undefined') {
        figure.splice(figure.indexOf(rightWs), 1);
        shape.lineTo(rightWs.x, rightWs.y);
        checkPath(rightWs, figure, shape);
    }
    else if (typeof downCs != 'undefined') {
        figure.splice(figure.indexOf(downCs), 1);
        shape.lineTo(downCs.x, downCs.y);
        checkPath(downCs, figure, shape);
    }
    else if (typeof downWs != 'undefined') {
        figure.splice(figure.indexOf(downWs), 1);
        shape.lineTo(downWs.x, downWs.y);
        checkPath(downWs, figure, shape);
    }
    else if (typeof leftCs != 'undefined') {
        figure.splice(figure.indexOf(leftCs), 1);
        shape.lineTo(leftCs.x, leftCs.y);
        checkPath(leftCs, figure, shape);
    }
    else if (typeof leftWs != 'undefined') {
        figure.splice(figure.indexOf(leftWs), 1);
        shape.lineTo(leftWs.x, leftWs.y);
        checkPath(leftWs, figure, shape);
    }
    else if (typeof topCs != 'undefined') {
        figure.splice(figure.indexOf(topCs), 1);
        shape.lineTo(topCs.x, topCs.y);
        checkPath(topCs, figure, shape);
    }
    else if (typeof topWs != 'undefined') {
        figure.splice(figure.indexOf(topWs), 1);
        shape.lineTo(topWs.x, topWs.y);
        checkPath(topWs, figure, shape);
    }
}



function truncateFigure(tempFigure) {
    let figure = [];
    for (let i = 0; i < tempFigure.length; i++) {
        let count = 0;
        if (tempFigure.some(item => item.x == tempFigure[i].x && item.y == tempFigure[i].y + (CELL_SIZE - WALL_SIZE))
            || tempFigure.some(item => item.x == tempFigure[i].x && item.y == tempFigure[i].y + (WALL_SIZE)))
            ++count;
        if (tempFigure.some(item => item.x == tempFigure[i].x && item.y == tempFigure[i].y - (CELL_SIZE - WALL_SIZE))
            || tempFigure.some(item => item.x == tempFigure[i].x && item.y == tempFigure[i].y - (WALL_SIZE)))
            ++count;
        if (tempFigure.some(item => item.x == tempFigure[i].x + (CELL_SIZE - WALL_SIZE) && item.y == tempFigure[i].y)
            || tempFigure.some(item => item.x == tempFigure[i].x + (WALL_SIZE) && item.y == tempFigure[i].y))
            ++count;
        if (tempFigure.some(item => item.x == tempFigure[i].x - (CELL_SIZE - WALL_SIZE) && item.y == tempFigure[i].y)
            || tempFigure.some(item => item.x == tempFigure[i].x - (WALL_SIZE) && item.y == tempFigure[i].y))
            ++count;
        if (tempFigure.some(item => item.x == tempFigure[i].x - (CELL_SIZE - WALL_SIZE) && item.y == tempFigure[i].y + (CELL_SIZE - WALL_SIZE))
            || tempFigure.some(item => item.x == tempFigure[i].x + (CELL_SIZE - WALL_SIZE) && item.y == tempFigure[i].y + (CELL_SIZE - WALL_SIZE))
            || tempFigure.some(item => item.x == tempFigure[i].x + (CELL_SIZE - WALL_SIZE) && item.y == tempFigure[i].y - (CELL_SIZE - WALL_SIZE))
            || tempFigure.some(item => item.x == tempFigure[i].x - (CELL_SIZE - WALL_SIZE) && item.y == tempFigure[i].y - (CELL_SIZE - WALL_SIZE)))
            ++count;

        if (count < 5)
            figure.push(tempFigure[i]);

    }
    // figure.forEach(element => {
    //     console.log(element);
    // });
    console.log(tempFigure);
    console.log(figure);
    return figure;
}



function follow(type, i, j, tempFigure, checkedCells) {
    if (FRONT_LEVEL[i][j] != 0) {
        if (type == "right") {
            // console.log(i, j);
            if (FRONT_LEVEL[i][j + 1] == FRONT_LEVEL[i][j] && FRONT_LEVEL[i][j + 1] != checkedCells[i][j + 1]) {
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // left top
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // right top
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // right bottom
                tempFigure.push({ x: (j + 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // left bottom
                checkedCells[i][j + 1] = FRONT_LEVEL[i][j + 1];
                follow("right", i, j + 1, tempFigure, checkedCells);

            }
            else follow("down", i, j, tempFigure, checkedCells);
        }
        if (type == "down" && i < 33) {
            // console.log(i, j);
            if (FRONT_LEVEL[i + 1][j] == FRONT_LEVEL[i][j] && FRONT_LEVEL[i + 1][j] != checkedCells[i + 1][j]) {
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -(i + 1) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // left top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -(i + 1) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // right top
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -(i + 1) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // right bottom
                tempFigure.push({ x: j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -(i + 1) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // left bottom
                checkedCells[i + 1][j] = FRONT_LEVEL[i + 1][j];
                follow("down", i + 1, j, tempFigure, checkedCells);
                follow('left', i + 1, j, tempFigure, checkedCells);
                follow('right', i + 1, j, tempFigure, checkedCells);

            }
        }
        if (type == "left") {
            // console.log(i, j);
            if (FRONT_LEVEL[i][j - 1] == FRONT_LEVEL[i][j] && FRONT_LEVEL[i][j - 1] != checkedCells[i][j - 1]) {
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // left top
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // right top
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // right bottom
                tempFigure.push({ x: (j - 1) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -i * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // left bottom
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


