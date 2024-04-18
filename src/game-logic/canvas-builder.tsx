import map from "../../public/adve/adve.json";
import tile from "../../public/adve/tiles.png";
import { createMapImageFromData } from "./map-utils";
import { Player } from "./player";
const SCALE = 3;
const PIXEL = 8;
const POSITION_OFFSET = {
  x: 0,
  y: 0,
};

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
const CELL_DIMENSION = PIXEL;
let COLLISION_COORDINATES: any;
const MAP_COLLISION_AREAS = {
  collisionBox: new Set<number>([]),
};

const generateCollisionFromCoords = (collisionArray: number[]) => {
  const collisionTileSet = new Set(collisionArray);
  collisionTileSet.delete(0);
  MAP_COLLISION_AREAS.collisionBox = collisionTileSet;
};

const updateVelocity = () => {
  const velocity = {
    x: 0,
    y: 0,
  };
  if (DOWN_KEY.left) {
    velocity.x = -2;
  }
  if (DOWN_KEY.right) {
    velocity.x = 2;
  }
  if (DOWN_KEY.top) {
    velocity.y = -10;
  }
  if (DOWN_KEY.down) {
    velocity.y = 2;
  }
  return velocity;
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

  generateCollisionFromCoords(map.layers[1].data);

  const player = new Player({
    dimension: { height: PIXEL, width: PIXEL },
    position: { x: 150, y: 0 },
    gravity: 3,
    tileSize: PIXEL,
    velocity: { x: 0, y: 1 },
    ctx,
    debug,
  });

  const updateUI = () => {
    window.requestAnimationFrame(updateUI);
    ctx.save();
    ctx.scale(SCALE, SCALE);
    clearCanvas(ctx);
    ctx.translate(-camera.position.x, -camera.position.y);
    drawCanvas(ctx, mapImage);
    player.velocity = updateVelocity();
    player.update();
    player.updateCameraBox(camera);
    if (debug) {
      for (let i of Object.values(COLLISION_COORDINATES)) {
        const [x, y]: any = i;

        ctx.fillStyle = "#f3000080";
        ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(player.position.x, player.position.y);
      ctx.lineTo(MOUSE_POS.x / SCALE, MOUSE_POS.y / SCALE);
      ctx.stroke();
    }
    ctx.fillStyle = "white";
    ctx.fillRect(
      player.position.x,
      player.position.y,
      CELL_DIMENSION,
      CELL_DIMENSION
    );
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
  };

  image.onload = () => {
    const { collisionSet, createdImage } = createMapImageFromData(
      map.layers[0].data,
      image,
      map.layers[0].width,
      map.layers[0].height,
      PIXEL,
      MAP_COLLISION_AREAS.collisionBox
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

  document.addEventListener("keydown", (e) => {
    if (e.key == "d") {
      DOWN_KEY.right = true;
    }
    if (e.key == "a") {
      DOWN_KEY.left = true;
    }
    if (e.key == "w") {
      DOWN_KEY.top = true;
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
};
