import { Entity, Objects } from './setup';
import * as THREE from 'three';

export type GhostState = 'chase' | 'scatter' | 'fright';

abstract class Ghost extends Entity {
    public state: GhostState;
    public lastCell: { x: number, y: number };
    public lastObject: Objects;
    protected constructor() {
        super();
        this.size = 20;
        this.animationTime = 135;
    }
    public updateCell(grid: number[][]) {
        grid[this.cell.i][this.cell.j] = this.lastObject;
        let i = this.cell.i - this.movement.y; let j = this.cell.j + this.movement.x;
        this.lastObject = grid[i][j];
        this.lastCell = { x: this.cell.j, y: this.cell.i };
        grid[i][j] = this.type;
        this.cell.i -= this.movement.y;
        this.cell.j += this.movement.x;
    }
}

export class Blinky extends Ghost {
    constructor() {
        super();
        this.type = Objects.blinky;
        this.material = new THREE.MeshLambertMaterial({ color: '#f71e1e' });
    }
}

export class Pinky extends Ghost {
    constructor() {
        super();
        this.type = Objects.pinky;
        this.material = new THREE.MeshLambertMaterial({ color: '#FF1FF8' });
    }
}

export class Inky extends Ghost {
    constructor() {
        super();
        this.type = Objects.inky;
        this.material = new THREE.MeshLambertMaterial({ color: '#FF1FF8' });
    }
}

export class Clyde extends Ghost {
    constructor() {
        super();
        this.type = Objects.clyde;
        this.material = new THREE.MeshLambertMaterial({ color: '#FF1FF8' });
    }
}