import map from "../../public/adve/adve.json";
import tile from "../../public/adve/tiles.png";
import hammerbot from "../../public/Hammer bot asset/Idle.png";
import run from "../../public/Hammer bot asset/Run.png";
import { COLLISION_COLLECTIONS } from "./constants";

import { createMapImageFromData } from "./map-utils";
import { Player } from "./player";
const SCALE = 5;
const PIXEL = 8;
const POSITION_OFFSET = {
  x: 0,
  y: 0,
};
const GRAVITY = 0.5;
const MOUSE_POS = {
  x: 0,
  y: 0,
};
const DOWN_KEY = {
  left: false,
  right: false,
  top: false,
  down: false,
};
const debug = false;

let COLLISION_COORDINATES: any;
const MAP_COLLISION_AREAS: { [key: string]: Set<number> } = {};

const generateCollisionFromCoords = (
  collisionArray: number[],
  collection: string
) => {
  const collisionTileSet = new Set(collisionArray);
  collisionTileSet.delete(0);
  MAP_COLLISION_AREAS[collection] = collisionTileSet;
};

const updateVelocity = () => {
  const velocity = {
    x: 0,
    y: 0,
  };

  let animation = "";
  let lastDirection = "";
  if (DOWN_KEY.left) {
    velocity.x = -2;
    animation = "RunLeft";
    lastDirection = "left";
  }
  if (DOWN_KEY.right) {
    velocity.x = 2;
    animation = "RunRight";
    lastDirection = "right";
  }
  if (DOWN_KEY.top) {
    // DOWN_KEY.top = false;
    velocity.y = 1;
  }
  if (DOWN_KEY.down) {
    // DOWN_KEY.down = false;
    velocity.y = 2;
  }
  return { velocity, lastDirection, animation };
};

const clearCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#0e071b";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
};
const drawCanvas = (ctx: CanvasRenderingContext2D, mapImage: any) => {
  if (!mapImage) return;
  ctx.drawImage(mapImage, POSITION_OFFSET.x, POSITION_OFFSET.y);
};

export const levelBuilder = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 6;

  const camera = {
    position: { x: 0, y: 0 },
    dimension: { width: canvas.width / SCALE, height: canvas.height / SCALE },
  };
  const image = new Image();
  image.src = tile;
  let mapImage: any = null;
  const collisonAreas = map.layers.find((item) => item.name == "obstacles");
  generateCollisionFromCoords(
    collisonAreas?.data || [],
    COLLISION_COLLECTIONS.COLLISION_BOX
  );
  const platformAreas = map.layers.find((item) => item.name == "platforms");
  generateCollisionFromCoords(
    platformAreas?.data || [],
    COLLISION_COLLECTIONS.COLLISION_PLATFORMS
  );

  const player = new Player({
    dimension: { height: PIXEL, width: PIXEL },
    position: { x: 150, y: 0 },
    gravity: GRAVITY,
    tileSize: PIXEL,
    velocity: { x: 0, y: 1 },
    ctx,
    debug,
    imageSrc: hammerbot,
    frameRate: 5,
    frameBuffer: 6,
    scale: 0.5,
    defaultAnimations: {
      left: "IdleLeft",
      right: "IdleRight",
    },
    animations: {
      IdleRight: {
        imageSrc: hammerbot,
        frameRate: 5,
        frameBuffer: 6,
      },
      IdleLeft: {
        imageSrc: hammerbot,
        frameRate: 5,
        frameBuffer: 6,
        invertDirection: true,
      },
      RunLeft: {
        imageSrc: run,
        frameRate: 8,
        frameBuffer: 3,
        invertDirection: true,
      },
      RunRight: {
        imageSrc: run,
        frameRate: 8,
        frameBuffer: 3,
      },
    },
    hitbox: {
      dimension: { height: 16, width: 14 },
      position: { x: 0, y: 0 },
      offset: { x: 18, y: 10 },
    },
  });
  document.addEventListener("keydown", (e) => {
    if (e.key == "d") {
      DOWN_KEY.right = true;
    }
    if (e.key == "a") {
      DOWN_KEY.left = true;
    }
    if (e.key == "w") {
      player.jump();
    }
    if (e.key == "s") {
      DOWN_KEY.down = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key == "d") {
      DOWN_KEY.right = false;
    }
    if (e.key == "a") {
      DOWN_KEY.left = false;
    }
    if (e.key == "w") {
      DOWN_KEY.top = false;
    }
    if (e.key == "s") {
      DOWN_KEY.down = false;
    }
  });
  const updateUI = () => {
    try {
      ctx.save();
      ctx.scale(SCALE, SCALE);
      clearCanvas(ctx);
      ctx.translate(-camera.position.x, -camera.position.y);
      drawCanvas(ctx, mapImage);
      const { velocity, animation, lastDirection } = updateVelocity();
      player.velocity.x = velocity.x;

      if (lastDirection) player.lastDirection = lastDirection;
      player.switchSprite(animation);
      player.update();
      player.updateCameraBox(camera);

      if (debug) {
        for (let i of Object.values(
          COLLISION_COORDINATES[COLLISION_COLLECTIONS.COLLISION_BOX]
        )) {
          const [x, y]: any = i;

          ctx.fillStyle = "#f3000080";
          ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
          ctx.fill();
        }
        for (let i of Object.values(
          COLLISION_COORDINATES[COLLISION_COLLECTIONS.COLLISION_PLATFORMS]
        )) {
          const [x, y]: any = i;

          ctx.fillStyle = "rgba(0,255,0,0.75)";
          ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
          ctx.fill();
        }
      }
      player.weapon.angle = Math.atan2(
        player.hitbox.position.y - (MOUSE_POS.y / SCALE + camera.position.y),
        player.hitbox.position.x - (MOUSE_POS.x / SCALE + camera.position.x)
      );
      player.weapon.mousePos = MOUSE_POS;
      ctx.beginPath();
      ctx.moveTo(player.position.x, player.position.y);

      ctx.lineTo(
        MOUSE_POS.x / SCALE + camera.position.x,
        MOUSE_POS.y / SCALE + camera.position.y
      );
      ctx.stroke();
      // ctx.fillStyle = "white";
      // ctx.fillRect(
      //   player.position.x,
      //   player.position.y,
      //   CELL_DIMENSION,
      //   CELL_DIMENSION
      // );
      ctx.fillStyle = "rgba(0,55,55,0.3)";
      if (debug) {
        ctx.fillRect(
          camera.position.x,
          camera.position.y,
          camera.dimension.width,
          camera.dimension.height
        );
      }
      ctx.restore();
      if (player.collided) return;
      window.requestAnimationFrame(updateUI);
    } catch (error) {
      console.log(error);
    }
  };

  image.onload = () => {
    const { collisionSet, createdImage } = createMapImageFromData(
      map.layers[0].data,
      image,
      map.layers[0].width,
      map.layers[0].height,
      PIXEL,
      MAP_COLLISION_AREAS
    );
    mapImage = createdImage;
    COLLISION_COORDINATES = collisionSet;
    player.collisionCoordinates = collisionSet;

    updateUI();
  };

  document.addEventListener("mousemove", (e) => {
    // console.log((Math.atan2(5, 5) * 180) / Math.PI);
    MOUSE_POS.x = e.clientX;
    MOUSE_POS.y = e.clientY;
  });
};
