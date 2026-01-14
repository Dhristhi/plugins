import { closestCenter, rectIntersection } from '@dnd-kit/core';

export const customCollisionDetection = (args) => {
  const { active, droppableContainers } = args;

  if (active.data.current?.type === 'palette-item') {
    return closestCenter(args);
  }

  const dropZones = Array.from(droppableContainers.values()).filter((container) =>
    container.id.includes('drop-')
  );

  if (dropZones.length > 0) {
    const dropZoneCollisions = rectIntersection({
      ...args,
      droppableContainers: new Map(dropZones.map((zone) => [zone.id, zone])),
    });

    if (dropZoneCollisions && dropZoneCollisions.length > 0) {
      return dropZoneCollisions;
    }
  }

  return closestCenter(args);
};
