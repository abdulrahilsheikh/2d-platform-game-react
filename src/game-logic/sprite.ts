import { PositionProp } from "./interfaces";

export interface ISpriteClass {
  position: PositionProp;
  imageSrc: string;
  frameRate?: number;
  frameBuffer?: number;
  scale?: number;
  ctx: CanvasRenderingContext2D;
  isVerticalSet?: boolean;
  invertDirection?: boolean;
}

export class Sprite {
  position;
  scale;
  loaded;
  image;
  width: number = 0;
  height: number = 0;
  frameRate;
  currentFrame;
  frameBuffer;
  elapsedFrames;
  ctx;
  isVerticalSet;
  invertDirection;
  rotate = false;
  angle = 0;
  constructor({
    position,
    imageSrc,
    frameRate = 1,
    frameBuffer = 3,
    scale = 1,
    ctx,
    isVerticalSet = false,
    invertDirection = false,
  }: ISpriteClass) {
    this.position = position;
    this.scale = scale;
    this.loaded = false;

    this.image = new Image();
    this.image.onload = () => {
      if (isVerticalSet) {
        this.width = this.image.width * this.scale;
        this.height = (this.image.height / this.frameRate) * this.scale;
      } else {
        this.width = (this.image.width / this.frameRate) * this.scale;
        this.height = this.image.height * this.scale;
      }
      this.loaded = true;
    };
    this.ctx = ctx;
    this.image.src = imageSrc;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrames = 0;
    this.isVerticalSet = isVerticalSet;
    this.invertDirection = invertDirection;
  }

  draw() {
    if (!this.image) return;

    const cropbox = this.isVerticalSet
      ? {
          position: {
            x: 0,
            y: this.currentFrame * (this.image.height / this.frameRate),
          },
          width: this.image.width,
          height: this.image.height / this.frameRate,
        }
      : {
          position: {
            x: this.currentFrame * (this.image.width / this.frameRate),
            y: 0,
          },
          width: this.image.width / this.frameRate,
          height: this.image.height,
        };
    if (this.invertDirection) {
      this.ctx.scale(-1, 1);
      if (this.rotate) {
        this.rotateFrame();
      }
      this.ctx.drawImage(
        this.image,
        cropbox.position.x,
        cropbox.position.y,
        cropbox.width,
        cropbox.height,
        -this.position.x - this.width,
        this.position.y,
        this.width,
        this.height
      );
      if (this.rotate) {
        this.resetRotateFrame();
      }
      this.ctx.scale(-1, 1);
    } else {
      if (this.rotate) {
        this.rotateFrame();
      }
      this.ctx.drawImage(
        this.image,
        cropbox.position.x,
        cropbox.position.y,
        cropbox.width,
        cropbox.height,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
      if (this.rotate) {
        this.resetRotateFrame();
      }
    }
  }

  update() {
    this.draw();
    this.updateFrames();
  }

  updateFrames() {
    this.elapsedFrames++;

    if (this.elapsedFrames % this.frameBuffer === 0) {
      if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
      else this.currentFrame = 0;
    }
  }
  resetRotateFrame() {
    if (this.invertDirection) {
      this.ctx.translate(
        -(this.position.x + this.width / 2),
        this.position.y + this.height / 2
      );

      this.ctx.rotate(this.angle);
      this.ctx.translate(
        this.position.x + this.width / 2,
        -(this.position.y + this.height / 2)
      );
    } else {
      this.ctx.translate(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
      );
      this.ctx.rotate(this.angle);
      this.ctx.translate(
        -(this.position.x + this.width / 2),
        -(this.position.y + this.height / 2)
      );
    }
  }

  rotateFrame() {
    if (this.invertDirection) {
      this.ctx.translate(
        -(this.position.x + this.width / 2),
        this.position.y + this.height / 2
      );

      this.ctx.rotate(-this.angle);
      this.ctx.translate(
        this.position.x + this.width / 2,
        -(this.position.y + this.height / 2)
      );
    } else {
      this.ctx.translate(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
      );
      this.ctx.rotate(this.angle);
      this.ctx.translate(
        -(this.position.x + this.width / 2),
        -(this.position.y + this.height / 2)
      );
    }
  }
}
