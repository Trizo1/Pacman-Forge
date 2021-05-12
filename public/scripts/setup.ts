import * as THREE from "three";

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export enum Objects {
    blank,
    wall,
    dynwall,
    spawnwall,
    dot,
    pacman,
    blinky,
    pinky,
    inky,
    clyde
}

export const Params = {
    CellSize: 20,
    CubeSize: 340,
    WallSize: 8,
    Depth: 20
}

export abstract class Entity {
    public cell: { i: number, j: number };
    public movement: { x: number, y: number };
    public moveDirection: Direction;
    public moveInterval?: any;
    public reqMove?: any;
    public posToMove?: THREE.Vector3;
    public material: any;
    public size: number;
    public animationTime: number;
    public mesh?: THREE.Mesh;
    public type: Objects;
    protected constructor() {
        this.cell = { i: 0, j: 0 };
        this.movement = { x: 0, y: 0 };
        this.moveDirection = 'none';
    }
    public stopMovement(x, y, grid) {
        clearInterval(this.moveInterval);
        cancelAnimationFrame(this.reqMove);
        this.moveInterval = null;
        this.reqMove = null;
        this.movement = { x: 0, y: 0 };
        this.moveDirection = 'none';
        this.posToMove = null;
    }
    public canMove(x: number, y: number, grid: number[][]) {
        let i = this.cell.i - y; let j = this.cell.j + x;
        if ((i >= 0 && i <= 33) && (j >= 0 && j <= 33))
            return grid[i][j] == Objects.blank || grid[i][j] == Objects.dot
    }
    public step(x: number, y: number) {
        this.movement.x = x;
        this.movement.y = y;
        this.posToMove = this.mesh.position.clone();
        this.posToMove = new THREE.Vector3(this.posToMove.x + x * Params.CellSize, this.posToMove.y + y * Params.CellSize, this.posToMove.z);
    }
    public abstract updateCell(grid: number[][]);
}

const FrontLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], //1
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], //2
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], //3
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0], //4
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0], //5
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0], //6
    [0, 0, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 0, 0], //7
    [0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0], //8
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0], //9
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0], //10
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0], //11
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0], //12
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0], //13
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0], //14
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0], //15
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 0, 1, 1, 1, 0, 6, 1, 1, 1, 0, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1], //16
    [4, 4, 4, 5, 4, 4, 4, 1, 1, 4, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4], //17
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1], //18
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1], //19
    [4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4], //20
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1], //21
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0], //22
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0], //23
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0], //24
    [0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0], //25
    [0, 0, 0, 1, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 1, 0, 0, 0], //26
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0], //27
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0], //28
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0], //29
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0], //30
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0], //31
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0], //32
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], //33
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], //34
];

const RightLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 4, 4, 4, 1, 1, 4, 1, 4, 4, 4, 1, 1, 4, 4, 4, 1, 4, 1, 1, 4, 4, 4, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
];

const LeftLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 1, 1, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
];

const TopLevel= [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 1, 0, 0, 0, 0, 1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 1, 0, 0, 0, 0, 1, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const DownLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 0],
    [0, 0, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 0, 0],
    [0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 4, 4, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 4, 4, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 1, 1, 4, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 4, 1, 1, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0],
    [1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1],
    [1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 4, 4, 4, 4],
    [1, 1, 1, 4, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 4, 1, 1, 1],
    [0, 0, 1, 4, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 1, 1, 4, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 4, 1, 1, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 4, 4, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 4, 4, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 1, 4, 1, 4, 1, 1, 1, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 1, 1, 1, 4, 1, 4, 1, 4, 1, 0, 0],
    [0, 0, 1, 4, 4, 4, 1, 4, 1, 1, 1, 4, 1, 4, 4, 4, 1, 1, 4, 4, 4, 1, 4, 1, 1, 1, 4, 1, 4, 4, 4, 1, 0, 0],
    [0, 0, 1, 1, 4, 1, 1, 4, 1, 1, 1, 4, 1, 4, 1, 4, 1, 1, 4, 1, 4, 1, 4, 1, 1, 1, 4, 1, 1, 4, 1, 1, 0, 0],
    [0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const BackLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1],
    [1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1, 1, 4, 1, 1, 1],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export interface Level {
    grid: number[][];
    offset: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number },
    color: string,
    dots?: any;
    pivot?: THREE.Object3D;
}

export const MAP: Level[] = [
    { grid: FrontLevel, offset: { x: 0, y: 0, z: Params.CubeSize }, rotation: { x: 0, y: 0, z: 0 }, color: '#c2b853' },
    { grid: BackLevel, offset: { x: 0, y: 0, z: -Params.CubeSize - Params.Depth }, rotation: { x: 0, y: 0, z: 0 }, color: '#ee0300' },
    { grid: RightLevel, offset: { x: Params.CubeSize, y: 0, z: 0 }, rotation: { x: 0, y: Math.PI / 2, z: 0 }, color: '#5036d9' },
    { grid: LeftLevel, offset: { x: -Params.CubeSize - Params.Depth, y: 0, z: 0 }, rotation: { x: 0, y: Math.PI / 2, z: 0 }, color: '#359c9c' },
    { grid: TopLevel, offset: { x: 0, y: Params.CubeSize + Params.Depth, z: 0 }, rotation: { x: Math.PI / 2, y: 0, z: 0 }, color: '#cb569a' },
    { grid: DownLevel, offset: { x: 0, y: -Params.CubeSize, z: 0 }, rotation: { x: Math.PI / 2, y: 0, z: 0 }, color: '#09bd77' },
];