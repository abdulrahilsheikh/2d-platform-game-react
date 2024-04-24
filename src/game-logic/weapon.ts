import { PositionProp } from "./interfaces";
import { Sprite } from "./sprite";

export class Weapon extends Sprite {
  weapons;
  ctx;
  mousePos: PositionProp = { x: 0, y: 0 };

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
  drawGun({ position, rotation }: { position: PositionProp }) {}
}
