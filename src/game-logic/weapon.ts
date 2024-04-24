import { Bullet } from "./bullet";
import { PositionProp } from "./interfaces";
import { Sprite } from "./sprite";
import bullet from "../../public/bullet.png";

export class Weapon extends Sprite {
  weapons;
  ctx;
  mousePos: PositionProp = { x: 0, y: 0 };
  muzzelPoint: PositionProp = { x: 0, y: 0 };
  isFiring = false;
  bullets: Bullet[] = [];
  lastQuadrant: PositionProp = { x: 0, y: 0 };
  debug = false;
  constructor({
    weapons,
    ctx,
    position,
  }: {
    weapons: string;
    ctx: CanvasRenderingContext2D;
    position: PositionProp;
  }) {
    super({
      ctx,
      imageSrc: weapons,
      position,
      frameRate: 1,
      frameBuffer: 1,
      isVerticalSet: false,
      scale: 0.5,
    });
    this.invertDirection = true;
    this.rotate = true;
    this.weapons = weapons;
    this.ctx = ctx;
  }

  computeAngle(y: number, x: number) {
    this.angle = Math.atan2(y, x);
    this.lastQuadrant = { x, y };
  }
  drawGun() {
    const angle = this.angle;
    const x = Math.cos(-angle);
    const y = Math.sin(angle);
    if (this.debug) {
      this.ctx.beginPath();
      this.ctx.moveTo(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
      );

      this.ctx.lineTo(
        this.position.x + this.width / 2 - (this.width / 2) * x,
        this.position.y + this.height / 2 - (this.width / 2) * y
      );
      this.ctx.stroke();
    }
    if (this.isFiring) {
      this.bullets.push(
        new Bullet({
          angle: this.angle,
          bullet: bullet,
          ctx: this.ctx,
          velocity: { x: x * -1, y: y * -1 },
          position: {
            x:
              this.position.x +
              this.width / 2 +
              Math.random() * 2 -
              (this.width / 2) * x,
            y:
              this.position.y +
              this.height / 2 +
              Math.random() * 2 -
              (this.width / 2) * y,
          },
          speed: 4,
        })
      );
    }
    this.bullets.forEach((item) => item.drawBullet());
    // if (this.bullets.length > 50) {
    // }
  }
}
