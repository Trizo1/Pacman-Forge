import { Objects, Params, Level, MAP } from './setup';
import { Pacman } from './pacman';
import { Blinky, Pinky, Inky, Clyde } from './ghosts';
import * as THREE from 'three';

interface Dot {
    i: number,
    j: number,
    mesh: THREE.Mesh,
}

export class Game {
    public curLevel: Level;
    public dotsArray: Dot[];
    public curDot: number;
    public geometry: any;
    public dotMaterial: any;
    public grid: number[][];
    public score: number;
    public scoreText: HTMLElement;

    constructor() {
        this.curLevel = MAP[0];
        this.dotMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
        this.score = 0;
        this.scoreText = document.getElementById('score');

    }

    public async initGame() {

    }

    public clearScene() {
        this.curDot = null;
        //this.removeDots();
        //NOP_VIEWER.impl.scene.remove(curLevel.pivot.name);
        this.curLevel.dots = [];
        this.curLevel.pivot = null;
    }

    /*public removeDots() {
        NOP_VIEWER.overlays.removeMesh(this.curLevel.pivot, "custom-scene");
        NOP_VIEWER.impl.sceneUpdated(true, false);
    }*/

    public initLevelGrid() {
        for (let i = 0; i < 34; i++) {
            this.grid[i] = [];
            this.curLevel.grid[i].forEach(element => {
                this.grid[i].push(element);
            });
        }
    }

    public async drawDots() {
        for (const level of MAP) {
            await this.drawLevelDots(level);
        }
    }

    public async drawLevelDots(level: Level) {
        this.dotsArray = [];
        let pivot = new THREE.Group();
        let side = new THREE.Object3D();
        let dots = this.findObject(Objects.dot, level.grid);
        return new Promise(function (resolve, reject) {
            for (const dot of dots) {
                this.drawDot(dot.i, dot.j);
            }
            for (const dot of this.dotsArray) {
                level.dots.push(dot);
                side.add(dot.mesh);
            }
            pivot.position.set(level.offset.x, level.offset.y, level.offset.z);
            pivot.rotation.setFromVector3(new THREE.Vector3(level.rotation.x, level.rotation.y, level.rotation.z));

            /*NOP_VIEWER.impl.scene.add(pivot);
            pivot.add(side);
            level.pivot = pivot;
            setTimeout(() => {
                NOP_VIEWER.overlays.addMesh(pivot, 'custom-scene');
                NOP_VIEWER.impl.sceneUpdated(true, false);
                resolve();
            }, 500);*/
        });
    }

    public drawDot(i: number, j: number) {
        this.geometry = new THREE.SphereGeometry(Params.CellSize - 15, 12, 12);
        let dot = new THREE.Mesh(this.geometry, this.dotMaterial);
        dot.position.set(j * Params.CellSize - (Params.CubeSize - Params.CellSize / 2), - (i) * Params.CellSize + (Params.CubeSize - Params.CellSize / 2), Params.CellSize - 8);
        dot.name = `dot_${this.dotsArray.length}`;
        this.dotsArray.push({
            i: i,
            j: j,
            mesh: dot,
        });
    }

    public findObject(object: Objects, grid: number[][]) {
        let array = [];
        for (let i = 0; i < 34; i++)
            for (let j = 0; j < 34; j++)
                if (grid[i][j] == object)
                    array.push({ i: i, j: j });
        return array;
    }
}
