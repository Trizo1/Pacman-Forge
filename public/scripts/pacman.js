import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE } from './setup.js';

export let pacman = {
    iCell: 0,
    jCell: 0,
    movement: { x: 0, y: 0 },
    moveDirection: null,
    moveInterval: null,
    reqMove: null,
    posToMove: null,
    material: new THREE.MeshLambertMaterial({ color: '#FF1FF8' }),
    radius: 12,
    animationTime: 120,
    mesh: null,
};

export const PACMAN_MOVEMENT = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
};

export function pacmanCanMove(x, y, grid) {
    if (pacman.iCell - y >= 0 && pacman.iCell - y <= 33 && pacman.jCell + x >= 0 && pacman.jCell + x <= 33)
        return OBJECT_LIST[grid[pacman.iCell - y][pacman.jCell + x]] == OBJECT_TYPE.BLANK ||
            OBJECT_LIST[grid[pacman.iCell - y][pacman.jCell + x]] == OBJECT_TYPE.DOT;
}

export function clearPacmanMovement() {
    clearInterval(pacman.moveInterval);
    cancelAnimationFrame(pacman.reqMove);
    pacman.moveInterval = null;
    pacman.reqMove = null;
    pacman.movement = { x: 0, y: 0 };
    pacman.moveDirection = null;
    pacman.posToMove = null;
}

export function updatePacmanCell(grid) {
    grid[pacman.iCell][pacman.jCell] = 0;
    grid[pacman.iCell - pacman.movement.y][pacman.jCell + pacman.movement.x] = 5;
    pacman.iCell -= pacman.movement.y;
    pacman.jCell += pacman.movement.x;
}

export function pacmanMoveStep(x, y) {
    pacman.movement.y = y;
    pacman.movement.x = x;
    pacman.posToMove = pacman.mesh.position.clone();
    pacman.posToMove = new THREE.Vector3(pacman.posToMove.x + x * CELL_SIZE, pacman.posToMove.y + y * CELL_SIZE, pacman.posToMove.z);
}