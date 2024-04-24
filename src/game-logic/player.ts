import { collision, platformCollision } from "./collision-utils";
import { COLLISION_COLLECTIONS } from "./constants";
import { DimensionProp, PositionProp } from "./interfaces";
import { ISpriteClass, Sprite } from "./sprite";
import { Weapon } from "./weapon";

import minigun from "../../public/minigun.png";

type CollisionObjectProp = {
  [key: string]: { [key: string]: [number, number] };
};
type AnimationProp = {
  [key: string]: {
    imageSrc: string;
    frameRate: number;
    frameBuffer: number;
    image?: any;
    invertDirection?: boolean;
    default?: string;
  };
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
type hitboxProps = {
  position: PositionProp;
  dimension: DimensionProp;
  offset: PositionProp;
};
interface IPlayerClass extends ISpriteClass {
  position: PositionProp;
  velocity: PositionProp;
  dimension: DimensionProp;
  gravity: number;
  tileSize: number;
  ctx: any;
  debug: boolean;
  animations: AnimationProp;
  hitbox: hitboxProps;
  defaultAnimations: { [key: string]: string };
}

function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}
function easeOutSine(x: number): number {
  return Math.sin((x * Math.PI) / 2);
}
const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

const easeOutLerp = ({
  initialPos,
  targetPos,
  factor,
}: {
  initialPos: number;
  targetPos: number;
  factor: number;
}) => {
  // console.log(easeOutQuint(factor), "fact");

  return lerp(initialPos, targetPos, easeOutSine(factor));
};
export class Player extends Sprite {
  dimension;
  position;
  velocity;
  collisionCoordinates: CollisionObjectProp = {};
  gravity;
  tileSize;
  ctx;
  debug;
  camerabox: any;
  animations: AnimationProp;
  hitbox: hitboxProps;
  lastDirection = "left";
  defaultAnimations;
  jumpHeight = 60;
  jumping = false;
  doubleJumping = false;
  jumpCount = 0;
  maxJumpCount = 2;
  collided = false;
  remainingJump = 0;
  targetJumpPos = 0;
  initialJumpPos = 0;
  isGrounded = true;
  weapon;
  constructor({
    dimension,
    position,
    velocity,
    debug,
    gravity,
    tileSize,
    ctx,
    animations,
    frameBuffer,
    frameRate,
    imageSrc,
    scale,
    hitbox,
    defaultAnimations,
  }: IPlayerClass) {
    super({
      ctx,
      imageSrc,
      position,
      frameRate,
      frameBuffer,
      isVerticalSet: true,
      scale,
    });
    this.dimension = dimension;
    this.position = position;
    this.velocity = velocity;
    this.gravity = gravity;
    this.tileSize = tileSize;
    this.ctx = ctx;
    this.debug = debug;
    this.animations = animations;
    /**
     * Loading all the images for this character
     */
    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imageSrc;

      this.animations[key].image = image;
    }
    this.hitbox = {
      ...hitbox,
      position: {
        x: position.x + hitbox.position.x,
        y: position.y + hitbox.position.y,
      },
    };
    this.defaultAnimations = defaultAnimations;
    this.weapon = new Weapon({
      ctx,
      position: this.hitbox.position,
      weapons: minigun,
    });
  }

  getPlayerIndexOnMap() {
    const xIndex = Math.floor(this.hitbox.position.x / this.tileSize);
    const yIndex = Math.floor(this.hitbox.position.y / this.tileSize);
    return { xIndex, yIndex };
  }

  jump() {
    if (!this.jumping && this.isGrounded) {
      this.jumping = true;
      this.jumpCount = 1;
      this.initialJumpPos = this.position.y;
      this.targetJumpPos = this.initialJumpPos - this.jumpHeight;
      this.isGrounded = false;
    } else if (
      !this.doubleJumping &&
      this.jumpCount < this.maxJumpCount &&
      !this.isGrounded
    ) {
      this.doubleJumping = true;
      this.jumpCount += 1;

      this.remainingJump = 0;
      this.initialJumpPos = this.position.y;
      this.targetJumpPos = this.initialJumpPos - this.jumpHeight;
    }
  }

  applyGravity() {
    if (!this.jumping) {
      this.velocity.y += this.gravity;
      if (this.velocity.y > this.tileSize) {
        this.velocity.y *= 0.75;
      }

      this.position.y += this.velocity.y;
    } else {
      this.remainingJump += 0.05;
      if (this.remainingJump >= 1) {
        this.remainingJump = 0;
        this.jumping = false;
        this.doubleJumping = false;
        this.velocity.y += this.gravity;
        return;
      }
      const j = easeOutLerp({
        initialPos: this.initialJumpPos,
        targetPos: this.targetJumpPos,
        factor: this.remainingJump,
      });

      this.position.y = j;
    }
  }

  switchSprite(key: string) {
    if (!key) {
      key = this.defaultAnimations[this.lastDirection];
    }
    if (this.image === this.animations[key].image || !this.loaded) return;

    this.invertDirection = !!this.animations[key]?.invertDirection;
    this.currentFrame = 0;
    this.image = this.animations[key].image;
    this.frameBuffer = this.animations[key].frameBuffer;
    this.frameRate = this.animations[key].frameRate;
  }

  checkCollisionHorizontally() {
    // const { xIndex, yIndex } = this.getPlayerIndexOnMap();
    for (let coords of Object.values(
      this.collisionCoordinates[COLLISION_COLLECTIONS.COLLISION_BOX] || []
    )) {
      // const coords: any =
      // for (let [idx, idy] of searchCollisionIndexes) {
      //   const coords: any =
      //     this.collisionCoordinates[`${xIndex + idx}-${yIndex + idy}`];

      if (coords) {
        const [x, y] = coords;

        if (
          collision({
            entity1: {
              position: this.hitbox.position,
              dimension: this.hitbox.dimension,
            },
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
            const offset =
              this.hitbox.position.x +
              this.hitbox.dimension.width -
              x * this.tileSize;
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
              this.hitbox.position.x - (x * this.tileSize + this.tileSize);
            this.position.x = this.position.x - offset + 0.01;
            break;
          }
        }
      }
    }
  }
  stopVerticalMovement() {
    this.remainingJump = 0;
    this.jumping = false;
    this.doubleJumping = false;
  }
  checkCollisionVertically() {
    // const { xIndex, yIndex } = this.getPlayerIndexOnMap();
    for (let coords of Object.values(
      this.collisionCoordinates[COLLISION_COLLECTIONS.COLLISION_BOX]
    )) {
      if (coords) {
        const [x, y] = coords;

        if (
          collision({
            entity1: {
              position: this.hitbox.position,
              dimension: this.hitbox.dimension,
            },
            entity2: {
              position: { x: this.tileSize * x, y: this.tileSize * y },
              dimension: { width: this.tileSize, height: this.tileSize },
            },
          })
        ) {
          if (this.velocity.y > 0) {
            this.velocity.y = 0;
            this.isGrounded = true;
            this.stopVerticalMovement();
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
            const offset =
              this.hitbox.position.y -
              this.position.y +
              this.hitbox.dimension.height;

            this.position.y = y * this.tileSize - offset - 0.01;
            return;
          }
          if (this.velocity.y < 0 || this.jumping || !this.isGrounded) {
            this.velocity.y = 0;
            this.isGrounded = false;
            this.stopVerticalMovement();
            console.log("v");

            if (this.debug) {
              this.ctx.fillStyle = "green";
              this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize,
                this.tileSize
              );
              this.ctx.fill();
              // this.collided = true;
            }
            const offset = this.hitbox.position.y - this.position.y;
            this.position.y = y * this.tileSize + this.tileSize - offset + 0.02;
            console.log(this.hitbox.position.y, offset);
            return;
          }
        }
      }
    }
    // this.updateHitbox();

    for (let coords of Object.values(
      this.collisionCoordinates[COLLISION_COLLECTIONS.COLLISION_PLATFORMS]
    )) {
      if (coords) {
        const [x, y] = coords;

        if (
          platformCollision({
            entity1: this.hitbox,
            entity2: {
              position: { x: this.tileSize * x, y: this.tileSize * y },
              dimension: { width: this.tileSize, height: this.tileSize },
            },
          })
        ) {
          if (this.velocity.y > 0) {
            this.velocity.y = 0;
            this.isGrounded = true;
            this.stopVerticalMovement();
            const offset =
              this.hitbox.position.y -
              this.position.y +
              this.hitbox.dimension.height;

            this.position.y = y * this.tileSize - offset - 0.01;
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

  updateHitbox() {
    this.hitbox.position = {
      x: this.position.x + this.hitbox.offset.x,
      y: this.position.y + this.hitbox.offset.y,
    };
  }

  update() {
    this.updateFrames();
    this.draw();

    this.position.x += this.velocity.x;
    this.updateHitbox();

    this.checkCollisionHorizontally();
    this.updateHitbox();
    this.applyGravity();
    this.updateHitbox();
    this.checkCollisionVertically();
    this.updateHitbox();
    if (this.debug) {
      this.ctx.fillStyle = "rgba(0,205,5,0.5)";
      this.ctx.fillRect(
        this.hitbox.position.x,
        this.hitbox.position.y,
        this.hitbox.dimension.width,
        this.hitbox.dimension.height
      );
      this.ctx.font = "10px serif";
      this.ctx.fillText(
        `x-${this.hitbox.position.x},y-${this.hitbox.position.y}`,
        this.hitbox.position.x + this.hitbox.dimension.width,
        this.hitbox.position.y
      );
      this.ctx.fill();
    }
    this.weapon.position = this.hitbox.position;
    this.weapon.updateFrames();
    // this.weapon.rotateFrame();
    this.weapon.draw();
    // console.log(this.weapon);
  }
}
