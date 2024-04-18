import { collision } from "./collision-utils";
import { PositionProp } from "./interfaces";

type CollisionObjectProp = {
  [key: string]: [number, number];
};

const searchCollisionIndexes = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

interface IPlayerClass {
  position: PositionProp;
  velocity: PositionProp;
  dimension: { height: number; width: number };
  //   collisionCoordinates: CollisionObjectProp;
  gravity: number;
  tileSize: number;
  ctx: any;
  debug: boolean;
}
export class Player {
  dimension;
  position;
  velocity;
  collisionCoordinates: CollisionObjectProp = {};
  gravity;
  tileSize;
  ctx;
  debug;
  camerabox: any;
  constructor({
    dimension,
    position,
    velocity,
    debug,
    gravity,
    tileSize,
    ctx,
  }: IPlayerClass) {
    this.dimension = dimension;
    this.position = position;
    this.velocity = velocity;

    this.gravity = gravity;
    this.tileSize = tileSize;
    this.ctx = ctx;
    this.debug = debug;
  }
  getPlayerIndexOnMap() {
    const xIndex = Math.floor(this.position.x / this.tileSize);
    const yIndex = Math.floor(this.position.y / this.tileSize);
    return { xIndex, yIndex };
  }
  applyGravity() {
    this.velocity.y += this.gravity;
    this.position.y += this.velocity.y;
  }

  checkCollisionHorizontally() {
    const { xIndex, yIndex } = this.getPlayerIndexOnMap();
    for (let [idx, idy] of searchCollisionIndexes) {
      const coords: any =
        this.collisionCoordinates[`${xIndex + idx}-${yIndex + idy}`];

      if (coords) {
        const [x, y] = coords;

        if (
          collision({
            entity1: { position: this.position, dimension: this.dimension },
            entity2: {
              position: { x: this.tileSize * x, y: this.tileSize * y },
              dimension: { width: this.tileSize, height: this.tileSize },
            },
          })
        ) {
          if (this.velocity.x > 0) {
            this.velocity.x = 0;

            if (this.debug) {
              this.ctx.fillStyle = "red";
              this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
              );
              this.ctx.fill();
            }
            const offset = this.position.x + this.tileSize - x * this.tileSize;
            this.position.x = this.position.x - offset - 0.01;
            break;
          }
          if (this.velocity.x < 0) {
            this.velocity.x = 0;
            if (this.debug) {
              this.ctx.fillStyle = "green";
              this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
              );
              this.ctx.fill();
            }
            const offset =
              this.position.x - (x * this.tileSize + this.tileSize);
            this.position.x = this.position.x - offset + 0.01;
            break;
          }
        }
      }
    }
  }

  checkCollisionVertically() {
    const { xIndex, yIndex } = this.getPlayerIndexOnMap();
    for (let [idx, idy] of searchCollisionIndexes) {
      const coords: any =
        this.collisionCoordinates[`${xIndex + idx}-${yIndex + idy}`];

      if (coords) {
        const [x, y] = coords;

        if (
          collision({
            entity1: { position: this.position, dimension: this.dimension },
            entity2: {
              position: { x: this.tileSize * x, y: this.tileSize * y },
              dimension: { width: this.tileSize, height: this.tileSize },
            },
          })
        ) {
          if (this.velocity.y > 0) {
            this.velocity.y = 0;
            if (this.debug) {
              this.ctx.fillStyle = "red";
              this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
              );
              this.ctx.fill();
            }
            const offset = this.position.y + this.tileSize - y * this.tileSize;
            this.position.y = this.position.y - offset - 0.01;
            break;
          }
          if (this.velocity.y < 0) {
            this.velocity.y = 0;
            if (this.debug) {
              this.ctx.fillStyle = "green";
              this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
              );
              this.ctx.fill();
            }
            const offset =
              this.position.y - (y * this.tileSize + this.tileSize);
            this.position.y = this.position.y - offset + 0.01;
            break;
          }
        }
      }
    }
  }
  updateCameraBox(camera: any) {
    const left = camera.position.x + camera.dimension.width / 3;
    const right = camera.position.x + (camera.dimension.width / 3) * 2;
    const top = camera.position.y + camera.dimension.height / 3;
    const bottom = camera.position.y + (camera.dimension.height / 3) * 2;

    if (left >= this.position.x) {
      const offset = left - this.position.x;
      camera.position.x -= offset;
    }
    if (top >= this.position.y) {
      const offset = top - this.position.y;
      camera.position.y -= offset;
    }
    if (right <= this.position.x) {
      const offset = this.position.x - right;
      camera.position.x += offset;
    }
    if (bottom <= this.position.y) {
      const offset = this.position.y - bottom;
      camera.position.y += offset;
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.checkCollisionHorizontally();
    this.applyGravity();
    this.checkCollisionVertically();
  }
}
