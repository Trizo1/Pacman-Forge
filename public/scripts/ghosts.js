import { OBJECT_TYPE, OBJECT_LIST, CELL_SIZE } from './setup.js';

export let Blinky = {
    iCell: 0,
    jCell: 0,
    movement: { x: 0, y: 0 },
    moveDirection: null,
    moveInterval: null,
    reqMove: null,
    posToMove: null,
    material: new THREE.MeshLambertMaterial({ color: '#f71e1e' }),
    size: 20,
    animationTime: 135,
    mesh: null,
    state: null,
    type: OBJECT_TYPE.BLINKY,
    prevCell: null,
    prevVal: null
};

export let Pinky = {
    iCell: 0,
    jCell: 0,
    movement: { x: 0, y: 0 },
    moveDirection: null,
    moveInterval: null,
    reqMove: null,
    posToMove: null,
    material: new THREE.MeshLambertMaterial({ color: '#FF1FF8' }),
    size: 14,
    animationTime: 120,
    mesh: null,
    state: null,
    type: OBJECT_TYPE.PINKY,
    prevCell: null,
    prevVal: null
};

export let Inky = {
    iCell: 0,
    jCell: 0,
    movement: { x: 0, y: 0 },
    moveDirection: null,
    moveInterval: null,
    reqMove: null,
    posToMove: null,
    material: new THREE.MeshLambertMaterial({ color: '#FF1FF8' }),
    size: 14,
    animationTime: 120,
    mesh: null,
    state: null,
    type: OBJECT_TYPE.INKY,
    prevCell: null,
    prevVal: null
};

export let Clyde = {
    iCell: 0,
    jCell: 0,
    movement: { x: 0, y: 0 },
    moveDirection: null,
    moveInterval: null,
    reqMove: null,
    posToMove: null,
    material: new THREE.MeshLambertMaterial({ color: '#FF1FF8' }),
    size: 14,
    animationTime: 120,
    mesh: null,
    state: null,
    type: OBJECT_TYPE.CLYDE,
    prevCell: null,
    prevVal: null

};

export const GHOST_MOVEMENT = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
};

export const GHOST_STATE = {
    CHASE: "chase",
    SCATTER: "scatter",
    FRIGHT: "fright"
}

export function ghostCanMove(x, y, grid, ghost) {
    if (ghost.iCell - y >= 0 && ghost.iCell - y <= 33 && ghost.jCell + x >= 0 && ghost.jCell + x <= 33)
        return OBJECT_LIST[grid[ghost.iCell - y][ghost.jCell + x]] == OBJECT_TYPE.BLANK ||
            OBJECT_LIST[grid[ghost.iCell - y][ghost.jCell + x]] == OBJECT_TYPE.DOT;
}

export function ghostMoveStep(x, y, ghost) {
    ghost.movement.y = y;
    ghost.movement.x = x;
    ghost.posToMove = ghost.mesh.position.clone();
    ghost.posToMove = new THREE.Vector3(ghost.posToMove.x + x * CELL_SIZE, ghost.posToMove.y + y * CELL_SIZE, ghost.posToMove.z);
}

export function updateGhostCell(ghost, grid) {
    grid[ghost.iCell][ghost.jCell] = ghost.prevVal;
    ghost.prevVal = grid[ghost.iCell - ghost.movement.y][ghost.jCell + ghost.movement.x]
    ghost.prevCell = { x: ghost.jCell, y: ghost.iCell };
    grid[ghost.iCell - ghost.movement.y][ghost.jCell + ghost.movement.x] = 6;
    ghost.iCell -= ghost.movement.y;
    ghost.jCell += ghost.movement.x;
}

export function clearGhostMovement(ghost) {
    clearInterval(ghost.moveInterval);
    cancelAnimationFrame(ghost.reqMove);
    ghost.moveInterval = null;
    ghost.reqMove = null;
    ghost.movement = { x: 0, y: 0 };
    ghost.moveDirection = null;
    ghost.posToMove = null;
}