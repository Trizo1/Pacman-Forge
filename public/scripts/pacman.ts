import { Entity, Objects } from './setup';
import * as THREE from 'three';

export class Pacman extends Entity {
    constructor() {
        super();
        this.material = new THREE.MeshLambertMaterial({ color: '#FF1FF8' });
        this.size = 12;
        this.animationTime = 120;
        this.type = Objects.pacman;
    }

    public updateCell(grid: number[][]) {
        grid[this.cell.i][this.cell.j] = Objects.blank;
        grid[this.cell.i - this.movement.y][this.cell.j + this.movement.x] = Objects.pacman;
        this.cell.i -= this.movement.y;
        this.cell.j += this.movement.x;
    }

}