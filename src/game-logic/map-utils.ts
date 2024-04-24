export const createMapImageFromData = (
  data: number[],
  image: HTMLImageElement,
  width: number,
  height: number,
  tileSize: number,
  mapCollisionTiles: any
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width * tileSize;
  canvas.height = height * tileSize;
  const ctx = canvas.getContext("2d")!;
  let xcount = 0;
  let ycount = 0;
  ctx.fillStyle = "black";
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();

  const collisionSet: any = {};
  const collisionCollectionKeys = Object.keys(mapCollisionTiles);
  collisionCollectionKeys.forEach((i) => {
    collisionSet[i] = {};
  });
  data.forEach((item) => {
    const x = xcount;
    xcount += 1;
    const y = ycount;

    if (xcount > 53) {
      ycount += 1;
      xcount = 0;
    }
    const tileY = item % 24 ? Math.floor(item / 24) : Math.floor(item / 24) - 1;
    const remainder = item - (item >= 24 ? tileY * 24 : 0);
    const tileX = remainder ? remainder - 1 : 23;
    for (let key of collisionCollectionKeys) {
      if (mapCollisionTiles[key].has(item)) {
        collisionSet[key][`${x}-${y}`] = [x, y];
        break;
      }
    }
    ctx.drawImage(
      image,
      tileX * tileSize,
      tileY * tileSize,
      tileSize,
      tileSize,
      x * tileSize,
      y * tileSize,
      tileSize,
      tileSize
    );
  });
  const createdImage = new Image();
  createdImage.src = canvas.toDataURL();
  return { createdImage, collisionSet };
};
