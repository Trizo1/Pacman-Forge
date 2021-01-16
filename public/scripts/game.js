import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE, DEPTH, CUBE_SIZE, WALL_SIZE, LEVELS } from './setup.js';

let pacman;
let curLevel;
let xPacmanCell;
let yPacmanCell;
let pacmanMovement = { x: 0, y: 0 };
let pacmanMoveInterval
let pacmanReqMove;
let pacmanPosToMove;
const pacmanMoveCounter = 6;
let pacmanDistanceTo = new THREE.Vector3(0, 0, 0);
let dotArray = [];
let eatDotInterval;
let curDot = null;

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
    const dotMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
    let tempFigure = [];
    let geometry;
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
                        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                        const wall = new THREE.Mesh(geometry, wallMaterial);
                        wall.position.set(level.offsetX, level.offsetY, level.offsetZ);
                        wall.rotation.setFromVector3(new THREE.Vector3(level.rotationX, level.rotationY, level.rotationZ));
                        NOP_VIEWER.overlays.addMesh(wall, 'custom-scene');
                    }
                    break;
                case OBJECT_TYPE.PACMAN:
                    xPacmanCell = j;
                    yPacmanCell = i;
                    geometry = new THREE.SphereGeometry(CELL_SIZE - 8, 32, 32);
                    pacman = new THREE.Mesh(geometry, pacmanMaterial);
                    pacman.position.set(level.offsetX + j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), level.offsetY - (i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), level.offsetZ + CELL_SIZE - 8);
                    pacman.moveDirection = '';
                    NOP_VIEWER.overlays.addMesh(pacman, 'custom-scene');
                    document.addEventListener('keydown', pacmanMove);
                    break;
                case OBJECT_TYPE.DOT:
                    let dot;
                    geometry = new THREE.SphereGeometry(CELL_SIZE - 15, 32, 32);
                    dot = new THREE.Mesh(geometry, dotMaterial);
                    dot.position.set(level.offsetX + j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), level.offsetY - (i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), level.offsetZ + CELL_SIZE - 8);
                    dot.name = `dot_${dotArray.length}`;
                    dotArray.push({
                        i: i,
                        j: j,
                        mesh: dot,
                    });
                    NOP_VIEWER.overlays.addMesh(dot, 'custom-scene');
                    break;
            }
        }
    }
}

function pacmanMove(e) {
    /* let pacmanPrevPos = pacman.position.clone();
    let prevCellPos = new THREE.Vector3(curLevel.offsetX + xPacmanCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetY - (yPacmanCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + CELL_SIZE - 8);
    let nextCellByMovement = { i: yPacmanCell + pacmanMovement.y, j: xPacmanCell + pacmanMovement.x };
    let nextCellPos = new THREE.Vector3(curLevel.offsetX + nextCellByMovement.j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetY - (nextCellByMovement.i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + CELL_SIZE - 8);*/
    switch (e.keyCode) {
        case 65: //A
            if (canMove(-1, 0) && pacman.moveDirection != "left") {
                if (pacmanMoveInterval && pacmanReqMove) {
                    clearInterval(pacmanMoveInterval);
                    cancelAnimationFrame(pacmanReqMove);
                    pacmanReqMove = null;
                    pacmanMoveInterval = null;
                }
                pacman.moveDirection = "left"
                moveTo(-1, 0);
            }
            break;
        case 68: //D
            if (canMove(1, 0) && pacman.moveDirection != "right") {
                if (pacmanMoveInterval && pacmanReqMove) {
                    clearInterval(pacmanMoveInterval);
                    cancelAnimationFrame(pacmanReqMove);
                    pacmanReqMove = null;
                    pacmanMoveInterval = null;
                }
                pacman.moveDirection = "right"
                moveTo(1, 0);
            }
            break;
        case 87: //W
            if (canMove(0, 1) && pacman.moveDirection != "up") {
                if (pacmanMoveInterval && pacmanReqMove) {
                    clearInterval(pacmanMoveInterval);
                    cancelAnimationFrame(pacmanReqMove);
                    pacmanReqMove = null;
                    pacmanMoveInterval = null;
                }
                pacman.moveDirection = "up";
                moveTo(0, 1);
            }
            break;
        case 83: //S
            if (canMove(0, -1) && pacman.moveDirection != "down") {
                if (pacmanMoveInterval && pacmanReqMove) {
                    clearInterval(pacmanMoveInterval);
                    cancelAnimationFrame(pacmanReqMove);
                    pacmanReqMove = null;
                    pacmanMoveInterval = null;
                }
                pacman.moveDirection = "down";
                moveTo(0, -1);
            }
            break;
    }
}

function canMove(x, y) {
    if (yPacmanCell - y >= 0 && yPacmanCell - y <= 33 && xPacmanCell + x >= 0 && xPacmanCell + x <= 33) {
        return OBJECT_LIST[curLevel.grid[yPacmanCell - y][xPacmanCell + x]] == OBJECT_TYPE.BLANK ||
            OBJECT_LIST[curLevel.grid[yPacmanCell - y][xPacmanCell + x]] == OBJECT_TYPE.DOT;
    }
}

function moveTo(x, y) {
    pacmanDistanceTo = new THREE.Vector3(0, 0, 0);
    pacmanMoveInterval = setInterval(() => {
        if (canMove(x, y)) {
            pacmanMovement.x = x;
            pacmanMovement.y = y;
            pacmanPosToMove = pacman.position.clone();
            pacmanPosToMove = new THREE.Vector3(pacmanPosToMove.x + x * CELL_SIZE, pacmanPosToMove.y + y * CELL_SIZE, pacmanPosToMove.z);
            pacmanDistanceTo = new THREE.Vector3(pacmanPosToMove.x - pacman.position.x, pacmanPosToMove.y - pacman.position.y, pacmanPosToMove.z - pacman.position.z);
            if (OBJECT_LIST[curLevel.grid[yPacmanCell - pacmanMovement.y][xPacmanCell + pacmanMovement.x]] == OBJECT_TYPE.DOT) {
                curDot = dotArray.find(item => item.i == yPacmanCell - pacmanMovement.y && item.j == xPacmanCell + pacmanMovement.x).mesh;
            }
            setupObjectPositionTween(pacman, pacman.position.clone(), pacmanPosToMove, 150, 0, TWEEN.Easing.Linear.None);
            updatePacmanCell();
        } else {
            cancelAnimationFrame(pacmanReqMove);
            clearInterval(pacmanMoveInterval);
            pacmanReqMove = null;
            pacmanMoveInterval = null;
        }
    }, 170);
    movePacman();
}
const movePacman = function() {
    pacmanReqMove = requestAnimationFrame(movePacman);
    TWEEN.update();
    //pacman.position.set(pacman.position.x + pacmanDistanceTo.x / pacmanMoveCounter, pacman.position.y + pacmanDistanceTo.y / pacmanMoveCounter,
    //pacman.position.z + pacmanDistanceTo.z / pacmanMoveCounter);
    NOP_VIEWER.impl.sceneUpdated(true, false);
    //NOP_VIEWER.impl.invalidate(true, false, true); то же самое NOP_VIEWER.impl.sceneUpdated(true, false);
};

function updatePacmanCell() {
    if (OBJECT_LIST[curLevel.grid[yPacmanCell - pacmanMovement.y][xPacmanCell + pacmanMovement.x]] == OBJECT_TYPE.DOT) {
        eatDot(yPacmanCell - pacmanMovement.y, xPacmanCell + pacmanMovement.x);
    }
    curLevel.grid[yPacmanCell][xPacmanCell] = 0;
    curLevel.grid[yPacmanCell - pacmanMovement.y][xPacmanCell + pacmanMovement.x] = 5;
    yPacmanCell -= pacmanMovement.y;
    xPacmanCell += pacmanMovement.x;
}

function eatDot(i, j) {
    // let dot = dotArray.find(item => item.i == i && item.j == j).mesh;
    // console.log(dot.position);
    // //console.log(pacman.position);
    // eatDotInterval = setInterval(() => {
    //     console.log(pacman.position);
    //     if (dot.position.x == Math.floor(pacman.position.x) && dot.position.y == Math.floor(pacman.position.y) && dot.position.z == Math.floor(pacman.position.z) ||
    //         dot.position.x == Math.ceil(pacman.position.x) && dot.position.y == Math.ceil(pacman.position.y) && dot.position.z == Math.ceil(pacman.position.z)) {
    //         console.log(5);
    //         NOP_VIEWER.overlays.removeMesh(dot, "custom-scene");
    //         clearInterval(eatDotInterval);
    //     }
    // }, 20);

}

function setupObjectPositionTween(object, source, target, duration, delay, easing) {
    new TWEEN.Tween(source)
        .to(target, duration)
        .delay(delay)
        .easing(easing)
        .onUpdate(function() {
            object.position.copy(source);
            if (curDot) {
                if (curDot.position.x == Math.floor(pacman.position.x) && curDot.position.y == Math.floor(pacman.position.y) && curDot.position.z == Math.floor(pacman.position.z) ||
                    curDot.position.x == Math.ceil(pacman.position.x) && curDot.position.y == Math.ceil(pacman.position.y) && curDot.position.z == Math.ceil(pacman.position.z)) {
                    NOP_VIEWER.overlays.removeMesh(curDot, "custom-scene");
                    curDot = null;
                }
            }
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
        if (checkPointToSkip(tempFigure, point.x, point.y + (CELL_SIZE - WALL_SIZE)) ||
            checkPointToSkip(tempFigure, point.x, point.y + (WALL_SIZE)))
            count++;
        if (checkPointToSkip(tempFigure, point.x, point.y - (CELL_SIZE - WALL_SIZE)) ||
            checkPointToSkip(tempFigure, point.x, point.y - (WALL_SIZE)))
            count++;
        if (checkPointToSkip(tempFigure, point.x + (CELL_SIZE - WALL_SIZE), point.y) ||
            checkPointToSkip(tempFigure, point.x + (WALL_SIZE), point.y))
            count++;
        if (checkPointToSkip(tempFigure, point.x - (CELL_SIZE - WALL_SIZE), point.y) ||
            checkPointToSkip(tempFigure, point.x - (WALL_SIZE), point.y))
            count++;
        if (checkPointToSkip(tempFigure, point.x - (CELL_SIZE - WALL_SIZE), point.y + (CELL_SIZE - WALL_SIZE)) ||
            checkPointToSkip(tempFigure, point.x + (CELL_SIZE - WALL_SIZE), point.y + (CELL_SIZE - WALL_SIZE)) ||
            checkPointToSkip(tempFigure, point.x + (CELL_SIZE - WALL_SIZE), point.y - (CELL_SIZE - WALL_SIZE)) ||
            checkPointToSkip(tempFigure, point.x - (CELL_SIZE - WALL_SIZE), point.y - (CELL_SIZE - WALL_SIZE)))
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
            } else
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
            } else
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