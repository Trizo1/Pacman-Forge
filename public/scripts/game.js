import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE, DEPTH, CUBE_SIZE, WALL_SIZE, LEVELS, } from './setup.js';
import { pacman, PACMAN_MOVEMENT, clearPacmanMovement, pacmanCanMove, updatePacmanCell, pacmanMoveStep } from './pacman.js';
import { Blinky, Pinky, Inky, Clyde, ghostCanMove, ghostMoveStep, clearGhostMovement, updateGhostCell, GHOST_MOVEMENT } from './ghosts.js';


let curLevel = LEVELS[0];

let dotsArray = [];
let curDot = null;

let geometry;
const dotMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });

let levelGrid = [];
let score = 0;
let scoreText;


window.onload = function () { // Rewrite to main.ts
    scoreText = document.getElementById('score');
    document.getElementById('newGame').onclick = startNewGame;
}

export async function initGame() {
    initLevelGrid();
    if (!NOP_VIEWER.overlays.hasScene('custom-scene'))
        NOP_VIEWER.overlays.addScene('custom-scene');
    await drawWalls();
    await drawDots();
    await drawPacman();
    await drawGhosts();
    releaseGhosts();
    document.getElementById('preloader').style.display = 'none';
}

function startNewGame() {
    score = 0;
    scoreText.innerHTML = `Счет: ${score}`;
    initLevelGrid();
    clearPacmanMovement();
    clearGhostMovement(Blinky);
    clearScene();
    pacman.tween.stop();
    Blinky.tween.stop();
    drawLevelDots(curLevel);
    findPacman().then(() => {
        pacman.mesh.position.set(curLevel.offset.x + pacman.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
            curLevel.offset.y - (pacman.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offset.z + pacman.radius);
        findGhosts().then(() => {
            Blinky.mesh.position.set(curLevel.offset.x + Blinky.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
                curLevel.offset.y - (Blinky.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offset.z + Blinky.size);
            releaseGhosts();
        });
    });
}

function clearScene() {
    curDot = null;
    removeDots();
    NOP_VIEWER.impl.scene.remove(curLevel.pivot.name); // Rewrite to main.ts
    curLevel.dots = [];
    curLevel.pivot = null;
}

function removeDots() { // Rewrite to main.ts
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

async function drawDots() { // Rewrite to main.ts
    for (const level of LEVELS) {
        await drawLevelDots(level);
    }
}

async function drawLevelDots(level) {
    dotsArray = [];
    let pivot = new THREE.Group();
    let side = new THREE.Object3D();
    let dots = findObject(OBJECT_TYPE.DOT, level.grid);
    return new Promise(function (resolve, reject) {
        for (const dot of dots) {
            drawDot(dot.i, dot.j);
        }
        for (const dot of dotsArray) {
            level.dots.push(dot);
            side.add(dot.mesh);
        }

        pivot.position.set(level.offset.x, level.offset.y, level.offset.z);
        pivot.rotation.setFromVector3(new THREE.Vector3(level.rotation.x, level.rotation.y, level.rotation.z));

        NOP_VIEWER.impl.scene.add(pivot);
        pivot.add(side);
        level.pivot = pivot;
        setTimeout(() => {
            NOP_VIEWER.overlays.addMesh(pivot, 'custom-scene');
            NOP_VIEWER.impl.sceneUpdated(true, false);
            resolve();
        }, 500);

    });
}

function drawDot(i, j) {
    let dot;
    geometry = new THREE.SphereGeometry(CELL_SIZE - 15, 12, 12);
    dot = new THREE.Mesh(geometry, dotMaterial);
    dot.position.set(j * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2), - (i) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), CELL_SIZE - 8);
    dot.name = `dot_${dotsArray.length}`;
    dotsArray.push({
        i: i,
        j: j,
        mesh: dot,
    });
}

async function drawGhosts() {
    return new Promise(function (resolve, reject) {
        findGhosts().then(() => {
            let Blinky_geometry = new THREE.BoxGeometry(Blinky.size, Blinky.size, Blinky.size);
            Blinky.material.side = THREE.DoubleSide;
            Blinky.mesh = new THREE.Mesh(Blinky_geometry, Blinky.material);
            Blinky.mesh.position.set(curLevel.offset.x + Blinky.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
                curLevel.offset.y - (Blinky.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offset.z + Blinky.size / 2);
            Blinky.mesh.name = "Blinky";
            NOP_VIEWER.overlays.addMesh(Blinky.mesh, 'custom-scene');
            NOP_VIEWER.impl.sceneUpdated(true, false);
            resolve();
        });
    });
}

async function drawPacman() {
    return new Promise(function (resolve, reject) {
        findPacman().then((() => {
            geometry = new THREE.SphereGeometry(pacman.radius, 32, 32);
            pacman.material.side = THREE.DoubleSide;
            pacman.mesh = new THREE.Mesh(geometry, pacman.material);
            pacman.mesh.position.set(curLevel.offset.x + pacman.jCell * CELL_SIZE - (CUBE_SIZE - CELL_SIZE / 2),
                curLevel.offset.y - (pacman.iCell) * CELL_SIZE + (CUBE_SIZE - CELL_SIZE / 2), curLevel.offset.z + pacman.radius);
            pacman.mesh.name = "pacman";
            NOP_VIEWER.overlays.addMesh(pacman.mesh, 'custom-scene');
            document.addEventListener('keydown', pacmanMove);
            NOP_VIEWER.impl.sceneUpdated(true, false);
            resolve();
        }));
    });
}

async function findPacman() {
    return new Promise(function (resolve, reject) {
        let obj = findObject(OBJECT_TYPE.PACMAN, curLevel.grid)[0];
        pacman.iCell = obj.i;
        pacman.jCell = obj.j;
        resolve();
    });
}

function findGhosts() {
    return new Promise(function (resolve, reject) {
        let obj = findObject(OBJECT_TYPE.BLINKY, curLevel.grid)[0];
        Blinky.iCell = obj.i;
        Blinky.jCell = obj.j;
        Blinky.prevCell = { x: obj.j, y: obj.i };
        Blinky.prevVal = 0;
        //levelGrid[obj.i][obj.j] = 4;
        resolve();
    });
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

async function drawWalls() {
    for (let level of LEVELS) {
        await drawWall(level);
    }
    NOP_VIEWER.impl.sceneUpdated(true, false);
}

async function drawWall(level) {
    let checkedCells = [];
    clearCheckedCells(checkedCells);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: level.color, });
    let tempFigure = [];
    let wallArray = findObject(OBJECT_TYPE.WALL, level.grid);

    return new Promise(function (resolve, reject) {
        for (const wall of wallArray) {
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
        }
        resolve();
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

function choseGhostDir(ghost, pacman, grid) {
    let counter;
    let leftCell = 999, rightCell = 999, topCell = 999, downCell = 999;
    switch (ghost.type) {
        case 'blinky':
            if ((grid[ghost.iCell][ghost.jCell - 1] == 0 || grid[ghost.iCell][ghost.jCell - 1] == 4) && (ghost.jCell - 1) != ghost.prevCell.x) {
                leftCell = Math.round(Math.sqrt(Math.pow(pacman.iCell - (ghost.iCell), 2) + Math.pow(pacman.jCell - (ghost.jCell - 1), 2)));
                ++counter;
            }
            if ((grid[ghost.iCell][ghost.jCell + 1] == 0 || grid[ghost.iCell][ghost.jCell + 1] == 4) && (ghost.jCell + 1) != ghost.prevCell.x) {
                rightCell = Math.round(Math.sqrt(Math.pow(pacman.iCell - (ghost.iCell), 2) + Math.pow(pacman.jCell - (ghost.jCell + 1), 2)));
                ++counter;
            }
            if ((grid[ghost.iCell - 1][ghost.jCell] == 0 || grid[ghost.iCell - 1][ghost.jCell] == 4) && (ghost.iCell - 1) != ghost.prevCell.y) {
                topCell = Math.round(Math.sqrt(Math.pow(pacman.iCell - (ghost.iCell - 1), 2) + Math.pow(pacman.jCell - (ghost.jCell), 2)));
                ++counter;
            }
            if ((grid[ghost.iCell + 1][ghost.jCell] == 0 || grid[ghost.iCell + 1][ghost.jCell] == 4) && (ghost.iCell + 1) != ghost.prevCell.y) {
                downCell = Math.round(Math.sqrt(Math.pow(pacman.iCell - (ghost.iCell + 1), 2) + Math.pow(pacman.jCell - (ghost.jCell), 2)));
                ++counter;
            }
            if (counter > 1); {
                let smallest = Math.min(leftCell, rightCell, topCell, downCell)
                if (smallest == topCell && smallest != 999) {
                    if (ghostCanMove(0, 1, levelGrid, ghost) && ghost.moveDirection != GHOST_MOVEMENT.UP) {
                        if (ghost.moveInterval && ghost.reqMove)
                            clearGhostMovement(ghost);
                        ghost.moveDirection = GHOST_MOVEMENT.UP;
                        ghostMoveTo(0, 1, ghost);
                    }
                }
                else if (smallest == downCell && smallest != 999) {
                    if (ghostCanMove(0, -1, levelGrid, ghost) && ghost.moveDirection != GHOST_MOVEMENT.DOWN) {
                        if (ghost.moveInterval && ghost.reqMove)
                            clearGhostMovement(ghost);
                        ghost.moveDirection = GHOST_MOVEMENT.DOWN;
                        ghostMoveTo(0, -1, ghost);
                    }
                }
                else if (smallest == leftCell && smallest != 999) {
                    if (ghostCanMove(-1, 0, levelGrid, ghost) && ghost.moveDirection != GHOST_MOVEMENT.LEFT) {
                        if (ghost.moveInterval && ghost.reqMove)
                            clearGhostMovement(ghost);
                        ghost.moveDirection = GHOST_MOVEMENT.LEFT;
                        ghostMoveTo(-1, 0, ghost);
                    }
                }
                else if (smallest == rightCell && smallest != 999) {
                    if (ghostCanMove(1, 0, levelGrid, ghost) && ghost.moveDirection != GHOST_MOVEMENT.RIGHT) {
                        if (ghost.moveInterval && ghost.reqMove)
                            clearGhostMovement(ghost);
                        ghost.moveDirection = GHOST_MOVEMENT.RIGHT;
                        ghostMoveTo(1, 0, ghost);
                    }
                }
                else {
                    ghost.prevCell = { x: ghost.jCell, y: ghost.iCell }
                }
            }
    }
}

function pacmanMoveTo(x, y) {
    pacman.moveInterval = setInterval(() => {
        if (pacmanCanMove(x, y, levelGrid)) {
            pacmanMoveStep(x, y);
            if (OBJECT_LIST[levelGrid[pacman.iCell - pacman.movement.y][pacman.jCell + pacman.movement.x]] == OBJECT_TYPE.DOT)
                curDot = curLevel.dots.find(item => item.i == pacman.iCell - pacman.movement.y && item.j == pacman.jCell + pacman.movement.x).mesh;
            setupObjectPositionTween(pacman, pacman.mesh.position.clone(), pacman.posToMove, pacman.animationTime, 0, TWEEN.Easing.Linear.None);
            updatePacmanCell(levelGrid);
        } else
            if (OBJECT_LIST[levelGrid[pacman.iCell - y][pacman.jCell + x]] == OBJECT_TYPE.BLINKY) {
                alert('Вы проиграли!');
                startNewGame();
            } else
                clearPacmanMovement();
    }, pacman.animationTime + 20);
    movePacman();
}

function ghostMoveTo(x, y, ghost) {
    Blinky.moveInterval = setInterval(() => {
        if (ghostCanMove(x, y, levelGrid, ghost)) {
            ghostMoveStep(x, y, ghost);
            setupObjectPositionTween(ghost, ghost.mesh.position.clone(), ghost.posToMove, ghost.animationTime, 0, TWEEN.Easing.Linear.None);
            updateGhostCell(ghost, levelGrid);
            choseGhostDir(ghost, pacman, levelGrid);
        }
        else {
            if (OBJECT_LIST[levelGrid[ghost.iCell - y][ghost.jCell + x]] == OBJECT_TYPE.PACMAN) {
                alert('Вы проиграли!');
                startNewGame();
            }
            else {
                clearGhostMovement(ghost);
                releaseGhosts();
            }
        }
    }, Blinky.animationTime + 20);
    moveGhost();

}

function releaseGhosts() {
    choseGhostDir(Blinky, pacman, levelGrid);
}

const movePacman = function () {
    pacman.reqMove = requestAnimationFrame(movePacman);
    TWEEN.update();
    NOP_VIEWER.impl.sceneUpdated(true, false);
};

const moveGhost = function () {
    Blinky.reqMove = requestAnimationFrame(moveGhost);
    TWEEN.update();
    NOP_VIEWER.impl.sceneUpdated(true, false);
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
    object.tween = new TWEEN.Tween(source)
        .to(target, duration)
        .delay(delay)
        .easing(easing)
        .onUpdate(function () {
            object.mesh.position.copy(source);
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
    }
}