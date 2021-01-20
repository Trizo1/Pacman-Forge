import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE, DEPTH, CUBE_SIZE, WALL_SIZE, LEVELS, } from './setup.js';
import { pacman, PACMAN_MOVEMENT, clearPacmanMovement, pacmanCanMove, updatePacmanCell, pacmanMoveStep } from './pacman.js';
// import * as THREE from "../node_modules/three/build/three.module.js";
// import GLTFLoader from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';
// import { GLTFLoader, Scene } from 'three-full';
// const loader = new GLTFLoader();
// import CSG from './three-csg.js';


let curLevel = LEVELS[0];

let dotsArray = [];
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
}

function startNewGame() {
    score = 0;
    scoreText.innerHTML = `Счет: ${score}`;
    initLevelGrid();
    clearPacmanMovement();
    clearScene();
    resetPacman();
    drawLevelDots(curLevel);
}

function resetPacman() {
    findPacman();
    pacman.mesh.position.set(curLevel.offset.x + pacman.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
        curLevel.offset.y - (pacman.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offset.z + pacman.radius);
}

function clearScene() {
    curDot = null;
    removeDots();
    NOP_VIEWER.impl.scene.remove(curLevel.pivot.name);
    curLevel.dots = [];
    curLevel.pivot = null;
}

function removeDots() {
    /* LEVELS.forEach(level => {
        NOP_VIEWER.overlays.removeMesh(level.pivot, "custom-scene");
    }); */
    NOP_VIEWER.overlays.removeMesh(curLevel.pivot, "custom-scene");
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
    for (let level of LEVELS) {
        drawLevelDots(level);
        NOP_VIEWER.impl.sceneUpdated(true, false);
    }
}

function drawLevelDots(level) {
    dotsArray = [];
    let pivot = new THREE.Group();
    let side = new THREE.Object3D();

    let dots = findObject(OBJECT_TYPE.DOT, level.grid);
    dots.forEach(dot => {
        drawDot(dot.i, dot.j);
    });
    dotsArray.forEach(dot => {
        level.dots.push(dot);
        side.add(dot.mesh);
    });

    pivot.position.set(level.offset.x, level.offset.y, level.offset.z);
    pivot.rotation.setFromVector3(new THREE.Vector3(level.rotation.x, level.rotation.y, level.rotation.z));

    NOP_VIEWER.impl.scene.add(pivot);
    pivot.add(side);
    level.pivot = pivot;
    NOP_VIEWER.overlays.addMesh(pivot, 'custom-scene');
}

function drawDot(i, j) {
    let dot;
    geometry = new THREE.SphereGeometry(CELL_SIZE - 15, 32, 32);
    dot = new THREE.Mesh(geometry, dotMaterial);
    dot.position.set(j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), - (i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), CELL_SIZE - 8);
    dot.name = `dot_${dotsArray.length}`;
    dotsArray.push({
        i: i,
        j: j,
        mesh: dot,
    });
    //NOP_VIEWER.overlays.addMesh(dot, 'custom-scene');
}

function drawPacman() {
    findPacman();
    // loader.load('./assets/pacman_.glb', (object) => {
    //     let scene = new Scene();
    //     scene.add(object.scene);
    //     NOP_VIEWER.impl.renderer(scene, NOP_VIEWER.impl.camera);
    // });
    // let sphere = new THREE.SphereGeometry(pacman.radius, 32, 32);
    // let shape = new THREE.Shape();
    // shape.moveTo(0, 0);
    // shape.lineTo(10, 5);
    // shape.lineTo(10, -5);
    // shape.lineTo(0, 0);
    // let extrudeSettings = {
    //     steps: 1,
    //     amount: 30,
    //     bevelEnabled: false,
    // };
    // let triangle = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // console.log(triangle);
    // let g1 = new THREE.BufferGeometry().fromGeometry(sphere);
    // let g2 = new THREE.BufferGeometry().fromGeometry(triangle)

    // // let meshSphere = new THREE.Mesh(sphere, pacman.material);
    // // let meshPrism = new THREE.Mesh(triangle, pacman.material);

    // let box1 = CSG.subtract([g1, g2]);
    // let ggg = CSG.BufferGeometry(box1);
    // console.log(ggg);
    // // let box2 = CSG.subtract([
    // //     meshSphere, meshPrism
    // // ]);

    // // NOP_VIEWER.overlays.addMesh(new THREE.Mesh(ggg, pacman.material), 'custom-scene');

    // // NOP_VIEWER.overlays.addMesh(box2, 'custom-scene');


    geometry = new THREE.SphereGeometry(pacman.radius, 32, 32);
    pacman.material.side = THREE.DoubleSide;
    pacman.mesh = new THREE.Mesh(geometry, pacman.material);
    pacman.mesh.position.set(curLevel.offset.x + pacman.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
        curLevel.offset.y - (pacman.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offset.z + pacman.radius);
    pacman.mesh.name = "pacman";
    NOP_VIEWER.overlays.addMesh(pacman.mesh, 'custom-scene');
    document.addEventListener('keydown', pacmanMove);
    NOP_VIEWER.impl.sceneUpdated(true, false);
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
    NOP_VIEWER.impl.sceneUpdated(true, false);
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
            wallMesh.position.set(level.offset.x, level.offset.y, level.offset.z);
            wallMesh.rotation.setFromVector3(new THREE.Vector3(level.rotation.x, level.rotation.y, level.rotation.z));
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
                curDot = curLevel.dots.find(item => item.i == pacman.iCell - pacman.movement.y && item.j == pacman.jCell + pacman.movement.x).mesh;
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
    let dotPos = curDot.position;
    let offset = curLevel.offset;
    if (dotPos.x + offset.x == Math.floor(pacman.mesh.position.x) && dotPos.y + offset.y == Math.floor(pacman.mesh.position.y) &&
        dotPos.z + offset.z == Math.floor(pacman.mesh.position.z) || dotPos.x + offset.x == Math.ceil(pacman.mesh.position.x) &&
        dotPos.y + offset.y == Math.ceil(pacman.mesh.position.y) && dotPos.z + offset.z == Math.ceil(pacman.mesh.position.z)) {
        score++;
        scoreText.innerHTML = `Счет: ${score}`;
        let dotIndex = curLevel.pivot.children[0].children.indexOf(curDot);
        curLevel.pivot.children[0].children.splice(dotIndex, 1);
        NOP_VIEWER.impl.sceneUpdated(true, false);
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