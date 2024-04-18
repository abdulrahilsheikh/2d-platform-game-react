import { PositionProp } from "./interfaces";

interface ISpriteClass {
  position: PositionProp;
  imageSrc: string;
  frameRate: number;
  frameBuffer: number;
  scale: number;
  ctx: any;
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
  constructor({
    position,
    imageSrc,
    frameRate = 1,
    frameBuffer = 3,
    scale = 1,
    ctx,
  }: ISpriteClass) {
    this.position = position;
    this.scale = scale;
    this.loaded = false;

    this.image = new Image();
    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * this.scale;
      this.height = this.image.height * this.scale;
      this.loaded = true;
    };
    this.ctx = ctx;
    this.image.src = imageSrc;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrames = 0;
  }

  draw() {
    if (!this.image) return;

    const cropbox = {
      position: {
        x: this.currentFrame * (this.image.width / this.frameRate),
        y: 0,
      },
      width: this.image.width / this.frameRate,
      height: this.image.height,
    };

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
}
