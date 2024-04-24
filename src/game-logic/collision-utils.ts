type CollisionProp = {
  position: { x: number; y: number };
  dimension: { width: number; height: number };
};

export const collision = ({
  entity1,
  entity2,
}: {
  entity1: CollisionProp;
  entity2: CollisionProp;
}) => {
  return (
    entity1.position.x + entity1.dimension.width >= entity2.position.x &&
    entity1.position.x <= entity2.dimension.width + entity2.position.x &&
    entity1.position.y + entity1.dimension.height >= entity2.position.y &&
    entity1.position.y <= entity2.dimension.height + entity2.position.y
  );
};

export const platformCollision = ({
  entity1,
  entity2,
}: {
  entity1: CollisionProp;
  entity2: CollisionProp;
}) => {
  return (
    entity1.position.y + entity1.dimension.height >= entity2.position.y &&
    entity1.position.y + entity1.dimension.height <=
      entity2.position.y + entity2.dimension.height &&
    entity1.position.x <= entity2.position.x + entity2.dimension.width &&
    entity1.position.x + entity1.dimension.width >= entity2.position.x
  );
};
