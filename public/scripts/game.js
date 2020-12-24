import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE, DEPTH, CUBE_SIZE, WALL_SIZE, LEVELS } from './setup.js';

let pacman;
let curLevel;
let xPacmanCell;
let yPacmanCell;
let pacmanMovement = { x: 0, y: 0 };
let pacmanMoveInterval
let pacmanReqMove;
let pacmanPosToMove;
const pacmanMoveCounter = 18;
let pacmanDistanceTo = new THREE.Vector3(0, 0, 0);;

export function initGame() {
    curLevel = LEVELS[0];
    drawLevels();
    NOP_VIEWER.impl.sceneUpdated(true, false);
}
function drawLevels() {
    if (!NOP_VIEWER.overlays.hasScene('custom-scene')) {
        NOP_VIEWER.overlays.addScene('custom-scene');
    }
    for (let level of LEVELS) {
        drawLevel(level);
    }
}

function drawLevel(level) {
    let checkedCells = [];
    clearCheckedCells(checkedCells);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: level.color, });
    const pacmanMaterial = new THREE.MeshLambertMaterial({ color: '#FF1FF8' });
    let tempFigure = [];
    for (let i = 0; i < 34; i++) {
        for (let j = 0; j < 34; j++) {
            switch (OBJECT_LIST[level.grid[i][j]]) {
                case OBJECT_TYPE.WALL:
                    if (level.grid[i][j] != checkedCells[i][j]) {
                        checkedCells[i][j] = 2;
                        tempFigureAdd(tempFigure, i, j);
                        follow(level.grid, "left", i, j, tempFigure, checkedCells);
                        follow(level.grid, "right", i, j, tempFigure, checkedCells);

                        let figure = truncateFigure(tempFigure);
                        tempFigure = [];
                        let shape = drawPath(figure);
                        let extrudeSettings = {
                            steps: 1,
                            amount: DEPTH,
                            bevelEnabled: false,
                        };
                        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                        const wall = new THREE.Mesh(geometry, wallMaterial);
                        wall.position.set(level.offsetX, level.offsetY, level.offsetZ);
                        wall.rotation.setFromVector3(new THREE.Vector3(level.rotationX, level.rotationY, level.rotationZ));
                        NOP_VIEWER.overlays.addMesh(wall, 'custom-scene');
                    }
                    break;
                case OBJECT_TYPE.PACMAN:
                    xPacmanCell = j;
                    yPacmanCell = i;
                    const geometry = new THREE.SphereGeometry(CELL_SIZE - 8, 32, 32);
                    pacman = new THREE.Mesh(geometry, pacmanMaterial);
                    pacman.position.set(level.offsetX + j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), level.offsetY - (i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), level.offsetZ + CELL_SIZE - 8);
                    NOP_VIEWER.overlays.addMesh(pacman, 'custom-scene');
                    document.addEventListener('keydown', pacmanMove);
                    break;
            }
        }
    }
}

function pacmanMove(e) {
    //надо переделывать отрисовку (movePacman), проверку на события нажатия wasd
    /* let pacmanPrevPos = pacman.position.clone();
    let prevCellPos = new THREE.Vector3(curLevel.offsetX + xPacmanCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetY - (yPacmanCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + CELL_SIZE - 8);
    let nextCellByMovement = { i: yPacmanCell + pacmanMovement.y, j: xPacmanCell + pacmanMovement.x };
    let nextCellPos = new THREE.Vector3(curLevel.offsetX + nextCellByMovement.j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetY - (nextCellByMovement.i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + CELL_SIZE - 8);
    console.log(pacmanPrevPos); */
    switch (e.keyCode) {
        case 65: //A
            //if (pacmanPrevPos.distanceTo(prevCellPos) == 0 || nextCellPos.distanceTo(pacman.position) == 0) {
            if (pacmanMoveInterval && pacmanReqMove) {
                clearInterval(pacmanMoveInterval);
                cancelAnimationFrame(pacmanReqMove);
                pacmanReqMove = null;
                pacmanMoveInterval = null;
            }
            moveTo(-1, 0);
            //}
            break;
        case 68: //D
            //if (pacmanPrevPos.distanceTo(prevCellPos) == 0 || nextCellPos.distanceTo(pacman.position) == 0) {
            if (pacmanMoveInterval && pacmanReqMove) {
                clearInterval(pacmanMoveInterval);
                cancelAnimationFrame(pacmanReqMove);
                pacmanReqMove = null;
                pacmanMoveInterval = null;
            }
            moveTo(1, 0);
            //}
            break;
        case 87: //W
            //if (pacmanPrevPos.distanceTo(prevCellPos) == 0 || nextCellPos.distanceTo(pacman.position) == 0) {
            if (pacmanMoveInterval && pacmanReqMove) {
                clearInterval(pacmanMoveInterval);
                cancelAnimationFrame(pacmanReqMove);
                pacmanReqMove = null;
                pacmanMoveInterval = null;
            }
            moveTo(0, 1);
            //}
            break;
        case 83: //S
            //if (pacmanPrevPos.distanceTo(prevCellPos) == 0 || nextCellPos.distanceTo(pacman.position) == 0) {
            if (pacmanMoveInterval && pacmanReqMove) {
                clearInterval(pacmanMoveInterval);
                cancelAnimationFrame(pacmanReqMove);
                pacmanReqMove = null;
                pacmanMoveInterval = null;
            }
            moveTo(0, -1);
            //}
            break;
    }
}
function moveTo(x, y) {
    pacmanDistanceTo = new THREE.Vector3(0, 0, 0);
    movePacman();
    pacmanMoveInterval = setInterval(() => {
        if (OBJECT_LIST[curLevel.grid[yPacmanCell - y][xPacmanCell + x]] == OBJECT_TYPE.BLANK || OBJECT_LIST[curLevel.grid[yPacmanCell - y][xPacmanCell + x]] == OBJECT_TYPE.DOT) {
            pacmanMovement.x = x;
            pacmanMovement.y = y;
            pacmanPosToMove = pacman.position.clone();
            pacmanPosToMove = new THREE.Vector3(pacmanPosToMove.x + x * CELL_SIZE, pacmanPosToMove.y + y * CELL_SIZE, pacmanPosToMove.z);
            pacmanDistanceTo = new THREE.Vector3(pacmanPosToMove.x - pacman.position.x, pacmanPosToMove.y - pacman.position.y, pacmanPosToMove.z - pacman.position.z);

            //setupObjectPositionTween(pacman, pacman.position.clone(), positionToMove, 0, 500, TWEEN.Easing.Linear.None);
            updatePacmanCell();
        } else {
            cancelAnimationFrame(pacmanReqMove);
            clearInterval(pacmanMoveInterval);
            pacmanReqMove = null;
            pacmanMoveInterval = null;
        }
    }, 300);
}
const movePacman = function () {
    pacmanReqMove = requestAnimationFrame(movePacman);
    //TWEEN.update();
    pacman.position.set(pacman.position.x + pacmanDistanceTo.x / pacmanMoveCounter, pacman.position.y + pacmanDistanceTo.y / pacmanMoveCounter,
        pacman.position.z + pacmanDistanceTo.z / pacmanMoveCounter);
    NOP_VIEWER.impl.sceneUpdated(true, false);
    //NOP_VIEWER.impl.invalidate(true, false, true); то же самое NOP_VIEWER.impl.sceneUpdated(true, false);
};

function updatePacmanCell() {
    curLevel.grid[yPacmanCell][xPacmanCell] = 0;
    curLevel.grid[yPacmanCell - pacmanMovement.y][xPacmanCell + pacmanMovement.x] = 5;
    yPacmanCell -= pacmanMovement.y;
    xPacmanCell += pacmanMovement.x;
    console.log(yPacmanCell, xPacmanCell);
}

function setupObjectPositionTween(object, source, target, duration, delay, easing) {
    new TWEEN.Tween(source)
        .to(target, duration)
        .delay(delay)
        .easing(easing)
        .onUpdate(function () {
            object.position.copy(source);
        })
        .start();
}

function tempFigureAdd(tempFigure, i, j) {
    tempFigure.push({ x: (j) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -(i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // left top
    tempFigure.push({ x: (j) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -(i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2 }); // right top
    tempFigure.push({ x: (j) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) + WALL_SIZE / 2, y: -(i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // right bottom
    tempFigure.push({ x: (j) * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2, y: -(i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2) - WALL_SIZE / 2 }); // left bottom
}

function clearCheckedCells(checkedCells) {
    for (let i = 0; i < 34; i++) {
        checkedCells[i] = [];
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
    let topCs = findPointAround(head.x, head.y + (CELL_SIZE - WALL_SIZE), figure);
    let topWs = findPointAround(head.x, head.y + (WALL_SIZE), figure);
    let rightCs = findPointAround(head.x + (CELL_SIZE - WALL_SIZE), head.y, figure);
    let rightWs = findPointAround(head.x + (WALL_SIZE), head.y, figure);
    let leftCs = findPointAround(head.x - (CELL_SIZE - WALL_SIZE), head.y, figure);
    let leftWs = findPointAround(head.x - (WALL_SIZE), head.y, figure);
    let downCs = findPointAround(head.x, head.y - (CELL_SIZE - WALL_SIZE), figure);
    let downWs = findPointAround(head.x, head.y - (WALL_SIZE), figure);

    let pointsAround = [rightCs, rightWs, downCs, downWs, leftCs, leftWs, topCs, topWs];
    for (let item of pointsAround) {
        if (typeof item != 'undefined') {
            figure.splice(figure.indexOf(item), 1);
            shape.lineTo(item.x, item.y);
            checkPath(item, figure, shape);
            break;
        }
    }
}

function findPointAround(x, y, figure) {
    return figure.find(item => item.x == x && item.y == y);
}

function truncateFigure(tempFigure) {
    let figure = [];
    for (let i = 0; i < tempFigure.length; i++) {
        let count = 0;
        let point = tempFigure[i];
        if (checkPointToSkip(tempFigure, point.x, point.y + (CELL_SIZE - WALL_SIZE))
            || checkPointToSkip(tempFigure, point.x, point.y + (WALL_SIZE)))
            count++;
        if (checkPointToSkip(tempFigure, point.x, point.y - (CELL_SIZE - WALL_SIZE))
            || checkPointToSkip(tempFigure, point.x, point.y - (WALL_SIZE)))
            count++;
        if (checkPointToSkip(tempFigure, point.x + (CELL_SIZE - WALL_SIZE), point.y)
            || checkPointToSkip(tempFigure, point.x + (WALL_SIZE), point.y))
            count++;
        if (checkPointToSkip(tempFigure, point.x - (CELL_SIZE - WALL_SIZE), point.y)
            || checkPointToSkip(tempFigure, point.x - (WALL_SIZE), point.y))
            count++;
        if (checkPointToSkip(tempFigure, point.x - (CELL_SIZE - WALL_SIZE), point.y + (CELL_SIZE - WALL_SIZE))
            || checkPointToSkip(tempFigure, point.x + (CELL_SIZE - WALL_SIZE), point.y + (CELL_SIZE - WALL_SIZE))
            || checkPointToSkip(tempFigure, point.x + (CELL_SIZE - WALL_SIZE), point.y - (CELL_SIZE - WALL_SIZE))
            || checkPointToSkip(tempFigure, point.x - (CELL_SIZE - WALL_SIZE), point.y - (CELL_SIZE - WALL_SIZE)))
            count++;
        if (count < 5)
            figure.push(tempFigure[i]);
    }
    return figure;
}

function checkPointToSkip(tempFigure, x, y) {
    return tempFigure.some(item => item.x == x && item.y == y);
}

function follow(levelGrid, type, i, j, tempFigure, checkedCells) {
    if (levelGrid[i][j] != 0) {
        if (type == "right") {
            if (levelGrid[i][j + 1] == levelGrid[i][j] && levelGrid[i][j + 1] != checkedCells[i][j + 1]) {
                tempFigureAdd(tempFigure, i, j + 1);
                checkedCells[i][j + 1] = levelGrid[i][j + 1];
                follow(levelGrid, "right", i, j + 1, tempFigure, checkedCells);
            }
            else
                follow(levelGrid, "down", i, j, tempFigure, checkedCells);
        }
        if (type == "down" && i < 33) {
            if (levelGrid[i + 1][j] == levelGrid[i][j] && levelGrid[i + 1][j] != checkedCells[i + 1][j]) {
                tempFigureAdd(tempFigure, i + 1, j);
                checkedCells[i + 1][j] = levelGrid[i + 1][j];
                follow(levelGrid, "down", i + 1, j, tempFigure, checkedCells);
                follow(levelGrid, "left", i + 1, j, tempFigure, checkedCells);
                follow(levelGrid, "right", i + 1, j, tempFigure, checkedCells);
            }
        }
        if (type == "left") {
            if (levelGrid[i][j - 1] == levelGrid[i][j] && levelGrid[i][j - 1] != checkedCells[i][j - 1]) {
                tempFigureAdd(tempFigure, i, j - 1);
                checkedCells[i][j - 1] = levelGrid[i][j - 1];
                follow(levelGrid, "left", i, j - 1, tempFigure, checkedCells);
            }
            else
                follow(levelGrid, "down", i, j, tempFigure, checkedCells);
        }
        /* if (type == "top" && i > 0) {
            if (levelGrid[i - 1][j] == levelGrid[i][j] && levelGrid[i - 1][j] != checkedCells[i - 1][j]) {
                tempFigureAdd(tempFigure, i - 1, j);
                checkedCells[i - 1][j] = levelGrid[i - 1][j];
                follow(levelGrid, "top", i - 1, j, tempFigure, checkedCells);
                follow(levelGrid, "left", i - 1, j, tempFigure, checkedCells);
                follow(levelGrid, "right", i - 1, j, tempFigure, checkedCells);
            }
        } */
    }
}



//PREVIOUS PROJECT
/* let sphere;
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
 */

