import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE, DEPTH, CUBE_SIZE, WALL_SIZE, LEVELS, } from './setup.js';
import { pacman, PACMAN_MOVEMENT, clearPacmanMovement, pacmanCanMove, updatePacmanCell, pacmanMoveStep } from './pacman.js';
// import * as THREE from "../node_modules/three/build/three.module.js";
// import GLTFLoader from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';

// const loader = new GLTFLoader();

let curLevel = LEVELS[0];

let dotArray = [];
let curDot = null;
//let pacmanTween;

let geometry;
const dotMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });

let levelGrid = [];
let score = 0;
let scoreText;

window.onload = function () {
    scoreText = document.getElementById('score');
    document.getElementById('newGame').onclick = startNewGame;
}

export function initGame() {
    /* document.getElementById("pause").onclick = function () {
        pacmanTween.stop();
        clearPacmanMovement();
    };
    document.getElementById("pause").onclick = function () {
        pacmanTween.start();
        pacmanMoveTo(pacman.movement.x, pacman.movement.y);
    }; */
    initLevelGrid();
    if (!NOP_VIEWER.overlays.hasScene('custom-scene'))
        NOP_VIEWER.overlays.addScene('custom-scene');
    drawWalls();
    drawPacman();
    drawDots();
    NOP_VIEWER.impl.sceneUpdated(true, false);
}

function startNewGame() {
    initLevelGrid();
    clearPacmanMovement();
    clearScene();
    resetPacman();
    drawDots();
    NOP_VIEWER.impl.sceneUpdated(true, false);
}

function resetPacman() {
    findPacman();
    pacman.mesh.position.set(curLevel.offsetX + pacman.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
        curLevel.offsetY - (pacman.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + pacman.radius);
}

function clearScene() {
    curDot = null;
    removeDots();
    dotArray = [];
}

function removeDots() {
    dotArray.forEach(dot => {
        NOP_VIEWER.overlays.removeMesh(dot.mesh, "custom-scene");
    });
    NOP_VIEWER.impl.sceneUpdated(true, false);
}

function initLevelGrid() {
    for (let i = 0; i < 34; i++) {
        levelGrid[i] = [];
        curLevel.grid[i].forEach(element => {
            levelGrid[i].push(element);
        });
    }
}

function drawDots() {
    let dots = findObject(OBJECT_TYPE.DOT, curLevel.grid);
    dots.forEach(dot => {
        drawDot(dot.i, dot.j);
    });
}

function drawDot(i, j) {
    let dot;
    geometry = new THREE.SphereGeometry(CELL_SIZE - 15, 32, 32);
    dot = new THREE.Mesh(geometry, dotMaterial);
    dot.position.set(curLevel.offsetX + j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
        curLevel.offsetY - (i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + CELL_SIZE - 8);
    dot.name = `dot_${dotArray.length}`;
    dotArray.push({
        i: i,
        j: j,
        mesh: dot,
    });
    NOP_VIEWER.overlays.addMesh(dot, 'custom-scene');
}

function drawPacman() {
    findPacman();
    geometry = new THREE.SphereGeometry(pacman.radius, 32, 32);
    pacman.mesh = new THREE.Mesh(geometry, pacman.material);
    pacman.mesh.position.set(curLevel.offsetX + pacman.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
        curLevel.offsetY - (pacman.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offsetZ + pacman.radius);
    pacman.mesh.name = "pacman";
    NOP_VIEWER.overlays.addMesh(pacman.mesh, 'custom-scene');
    document.addEventListener('keydown', pacmanMove);
}

function findPacman() {
    let obj = findObject(OBJECT_TYPE.PACMAN, curLevel.grid)[0];
    pacman.iCell = obj.i;
    pacman.jCell = obj.j;
}

function findObject(object, grid) {
    let array = [];
    for (let i = 0; i < 34; i++) {
        for (let j = 0; j < 34; j++) {
            if (OBJECT_LIST[grid[i][j]] == object)
                array.push({ i: i, j: j });
        }
    }
    return array;
}

function drawWalls() {
    for (let level of LEVELS) {
        drawWall(level);
    }
}

function drawWall(level) {
    let checkedCells = [];
    clearCheckedCells(checkedCells);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: level.color, });
    let tempFigure = [];
    let wallArray = findObject(OBJECT_TYPE.WALL, level.grid);
    wallArray.forEach(wall => {
        if (level.grid[wall.i][wall.j] != checkedCells[wall.i][wall.j]) {
            checkedCells[wall.i][wall.j] = 2;
            tempFigureAdd(tempFigure, wall.i, wall.j);
            follow(level.grid, "left", wall.i, wall.j, tempFigure, checkedCells);
            follow(level.grid, "right", wall.i, wall.j, tempFigure, checkedCells);

            let figure = truncateFigure(tempFigure);
            tempFigure = [];
            let shape = drawPath(figure);
            let extrudeSettings = {
                steps: 1,
                amount: DEPTH,
                bevelEnabled: false,
            };
            geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const wallMesh = new THREE.Mesh(geometry, wallMaterial);
            wallMesh.position.set(level.offsetX, level.offsetY, level.offsetZ);
            wallMesh.rotation.setFromVector3(new THREE.Vector3(level.rotationX, level.rotationY, level.rotationZ));
            NOP_VIEWER.overlays.addMesh(wallMesh, 'custom-scene');
        }
    });
}

function pacmanMove(e) {
    switch (e.keyCode) {
        case 65: //A
            if (pacmanCanMove(-1, 0, curLevel.grid) && pacman.moveDirection != PACMAN_MOVEMENT.LEFT) {
                if (pacman.moveInterval && pacman.reqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.LEFT;
                pacmanMoveTo(-1, 0);
            }
            break;
        case 68: //D
            if (pacmanCanMove(1, 0, curLevel.grid) && pacman.moveDirection != PACMAN_MOVEMENT.RIGHT) {
                if (pacman.moveInterval && pacman.reqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.RIGHT;
                pacmanMoveTo(1, 0);
            }
            break;
        case 87: //W
            if (pacmanCanMove(0, 1, curLevel.grid) && pacman.moveDirection != PACMAN_MOVEMENT.UP) {
                if (pacman.moveInterval && pacman.reqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.UP;
                pacmanMoveTo(0, 1);
            }
            break;
        case 83: //S
            if (pacmanCanMove(0, -1, curLevel.grid) && pacman.moveDirection != PACMAN_MOVEMENT.DOWN) {
                if (pacman.moveInterval && pacman.reqMove)
                    clearPacmanMovement();
                pacman.moveDirection = PACMAN_MOVEMENT.DOWN;
                pacmanMoveTo(0, -1);
            }
            break;
    }
}

function pacmanMoveTo(x, y) {
    pacman.moveInterval = setInterval(() => {
        if (pacmanCanMove(x, y, levelGrid)) {
            pacmanMoveStep(x, y);
            if (OBJECT_LIST[levelGrid[pacman.iCell - pacman.movement.y][pacman.jCell + pacman.movement.x]] == OBJECT_TYPE.DOT)
                curDot = dotArray.find(item => item.i == pacman.iCell - pacman.movement.y && item.j == pacman.jCell + pacman.movement.x).mesh;
            setupObjectPositionTween(pacman.mesh, pacman.mesh.position.clone(), pacman.posToMove, pacman.animationTime, 0, TWEEN.Easing.Linear.None);
            updatePacmanCell(levelGrid);
        } else
            clearPacmanMovement();
    }, pacman.animationTime + 20);
    movePacman();
}

const movePacman = function () {
    pacman.reqMove = requestAnimationFrame(movePacman);
    TWEEN.update();
    NOP_VIEWER.impl.sceneUpdated(true, false);
    //NOP_VIEWER.impl.invalidate(true, false, true); то же самое NOP_VIEWER.impl.sceneUpdated(true, false);
};

function eatDot() {
    if (curDot.position.x == Math.floor(pacman.mesh.position.x) && curDot.position.y == Math.floor(pacman.mesh.position.y) &&
        curDot.position.z == Math.floor(pacman.mesh.position.z) || curDot.position.x == Math.ceil(pacman.mesh.position.x) &&
        curDot.position.y == Math.ceil(pacman.mesh.position.y) && curDot.position.z == Math.ceil(pacman.mesh.position.z)) {
        score++;
        scoreText.innerHTML = `Счет: ${score}`;
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