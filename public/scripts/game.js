import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE, DEPTH, CUBE_SIZE, WALL_SIZE, LEVELS, PACMAN_SPEED, PACMAN_MOVEMENT } from './setup.js';

let curLevel;

let pacman;
let xPacmanCell;
let yPacmanCell;
let pacmanMovement = { x: 0, y: 0 };
let pacmanMoveInterval;
let pacmanReqMove;
let pacmanPosToMove;
let pacmanDistanceTo = new THREE.Vector3(0, 0, 0);

let dotArray = [];
let curDot = null;

const pacmanMaterial = new THREE.MeshLambertMaterial({ color: '#FF1FF8' });
const dotMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });

export function initGame() {
    curLevel = LEVELS[0];
    drawLevels();
    NOP_VIEWER.impl.sceneUpdated(true, false);
}

function drawLevels() {
    if (!NOP_VIEWER.overlays.hasScene('custom-scene'))
        NOP_VIEWER.overlays.addScene('custom-scene');
    for (let level of LEVELS) {
        drawLevel(level);
    }
}

function drawLevel(level) {
    let checkedCells = [];
    clearCheckedCells(checkedCells);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: level.color, });
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
    switch (e.keyCode) {
        case 65: //A
            if (pacmanCanMove(-1, 0) && pacman.moveDirection != PACMAN_MOVEMENT.LEFT) {
                if (pacmanMoveInterval && pacmanReqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.LEFT;
                pacmanMoveTo(-1, 0);
            }
            break;
        case 68: //D
            if (pacmanCanMove(1, 0) && pacman.moveDirection != PACMAN_MOVEMENT.RIGHT) {
                if (pacmanMoveInterval && pacmanReqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.RIGHT;
                pacmanMoveTo(1, 0);
            }
            break;
        case 87: //W
            if (pacmanCanMove(0, 1) && pacman.moveDirection != PACMAN_MOVEMENT.UP) {
                if (pacmanMoveInterval && pacmanReqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.UP;
                pacmanMoveTo(0, 1);
            }
            break;
        case 83: //S
            if (pacmanCanMove(0, -1) && pacman.moveDirection != PACMAN_MOVEMENT.DOWN) {
                if (pacmanMoveInterval && pacmanReqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.DOWN;
                pacmanMoveTo(0, -1);
            }
            break;
    }
}

function clearPacmanMovement() {
    clearInterval(pacmanMoveInterval);
    cancelAnimationFrame(pacmanReqMove);
    pacmanReqMove = null;
    pacmanMoveInterval = null;
}

function pacmanCanMove(x, y) {
    if (yPacmanCell - y >= 0 && yPacmanCell - y <= 33 && xPacmanCell + x >= 0 && xPacmanCell + x <= 33) {
        return OBJECT_LIST[curLevel.grid[yPacmanCell - y][xPacmanCell + x]] == OBJECT_TYPE.BLANK ||
            OBJECT_LIST[curLevel.grid[yPacmanCell - y][xPacmanCell + x]] == OBJECT_TYPE.DOT;
    }
}

function pacmanMoveTo(x, y) {
    pacmanDistanceTo = new THREE.Vector3(0, 0, 0);
    pacmanMoveInterval = setInterval(() => {
        if (pacmanCanMove(x, y)) {
            pacmanMovement.x = x;
            pacmanMovement.y = y;
            pacmanPosToMove = pacman.position.clone();
            pacmanPosToMove = new THREE.Vector3(pacmanPosToMove.x + x * CELL_SIZE, pacmanPosToMove.y + y * CELL_SIZE, pacmanPosToMove.z);
            pacmanDistanceTo = new THREE.Vector3(pacmanPosToMove.x - pacman.position.x, pacmanPosToMove.y - pacman.position.y, pacmanPosToMove.z - pacman.position.z);
            if (OBJECT_LIST[curLevel.grid[yPacmanCell - pacmanMovement.y][xPacmanCell + pacmanMovement.x]] == OBJECT_TYPE.DOT)
                curDot = dotArray.find(item => item.i == yPacmanCell - pacmanMovement.y && item.j == xPacmanCell + pacmanMovement.x).mesh;
            setupObjectPositionTween(pacman, pacman.position.clone(), pacmanPosToMove, PACMAN_SPEED, 0, TWEEN.Easing.Linear.None);
            updatePacmanCell();
        } else
            clearPacmanMovement();
    }, PACMAN_SPEED + 20);
    movePacman();
}
const movePacman = function () {
    pacmanReqMove = requestAnimationFrame(movePacman);
    TWEEN.update();
    NOP_VIEWER.impl.sceneUpdated(true, false);
    //NOP_VIEWER.impl.invalidate(true, false, true); то же самое NOP_VIEWER.impl.sceneUpdated(true, false);
};

function updatePacmanCell() {
    curLevel.grid[yPacmanCell][xPacmanCell] = 0;
    curLevel.grid[yPacmanCell - pacmanMovement.y][xPacmanCell + pacmanMovement.x] = 5;
    yPacmanCell -= pacmanMovement.y;
    xPacmanCell += pacmanMovement.x;
}

function eatDot() {
    if (curDot.position.x == Math.floor(pacman.position.x) && curDot.position.y == Math.floor(pacman.position.y) && curDot.position.z == Math.floor(pacman.position.z) ||
        curDot.position.x == Math.ceil(pacman.position.x) && curDot.position.y == Math.ceil(pacman.position.y) && curDot.position.z == Math.ceil(pacman.position.z)) {
        NOP_VIEWER.overlays.removeMesh(curDot, "custom-scene");
        curDot = null;
    }
}

function setupObjectPositionTween(object, source, target, duration, delay, easing) {
    new TWEEN.Tween(source)
        .to(target, duration)
        .delay(delay)
        .easing(easing)
        .onUpdate(function () {
            object.position.copy(source);
            if (curDot)
                eatDot();
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
    for (let i = 0; i < 34; i++)
        checkedCells[i] = [];
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