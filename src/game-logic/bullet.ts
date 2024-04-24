import { PositionProp } from "./interfaces";
import { Sprite } from "./sprite";

export class Bullet extends Sprite {
  bullet;
  ctx;
  mousePos: PositionProp = { x: 0, y: 0 };
  muzzelPoint: PositionProp = { x: 0, y: 0 };
  isFiring = false;
  velocity: PositionProp = { x: 0, y: 0 };
  speed;
  constructor({
    bullet,
    ctx,
    position,
    angle,
    velocity,
    speed = 1,
  }: {
    bullet: string;
    ctx: CanvasRenderingContext2D;
    position: PositionProp;
    angle: number;
    velocity: PositionProp;
    speed?: number;
  }) {
    super({
      ctx,
      imageSrc: bullet,
      position,
      frameRate: 1,
      frameBuffer: 1,
      isVerticalSet: false,
      scale: 0.5,
    });
    this.invertDirection = true;
    this.rotate = true;
    this.bullet = bullet;
    this.ctx = ctx;
    this.angle = angle;
    this.velocity = velocity;
    this.speed = speed;
  }
  updateBulletPosition() {
    this.position.x += this.velocity.x * this.speed;
    this.position.y += this.velocity.y * this.speed;
  }
  drawBullet() {
    this.draw();
    this.updateBulletPosition();
  }
}
