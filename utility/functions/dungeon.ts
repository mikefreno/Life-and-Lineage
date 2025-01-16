import { PlayerCharacter } from "../../entities/character";
import { SpecialEncounter } from "../../entities/dungeon";
import { DungeonStore } from "../../stores/DungeonStore";

export const calculateFleeChance = (
  dexterity: number,
  difficulty: number,
): number => {
  const baseChance = 50;

  const dexBonus = (Math.log(dexterity + 1) / Math.log(1.5)) * 2;

  const difficultyPenalty = (difficulty * difficulty) / 50;

  let totalChance = baseChance + dexBonus - difficultyPenalty;

  return Math.min(95, Math.max(5, totalChance));
};

export const fleeRoll = (
  playerState: PlayerCharacter,
  dungeonStore: DungeonStore,
): boolean => {
  const dexterity = playerState.totalDexterity;
  const difficulty = dungeonStore.currentInstance?.difficulty ?? 1;

  const fleeChance = calculateFleeChance(dexterity, difficulty);
  const roll = Math.random() * 100;

  return roll <= fleeChance;
};

/**
 * Represents a tile in the dungeon map.
 * @property {number} x - The x-coordinate of the tile.
 * @property {number} y - The y-coordinate of the tile.
 * @property {boolean} clearedRoom - Indicates if the room at this tile has been cleared.
 * @property {boolean} isBossRoom - Indicates if the room at this tile is a boss room.
 */
export interface Tile {
  x: number;
  y: number;
  clearedRoom: boolean;
  isBossRoom: boolean;
  specialEncounter?: SpecialEncounter;
}

/**
 * Represents the bounding box of a set of tiles.
 * @property {number} width - The width of the bounding box.
 * @property {number} height - The height of the bounding box.
 * @property {number} offsetX - The x-offset of the bounding box.
 * @property {number} offsetY - The y-offset of the bounding box.
 */
export interface BoundingBox {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Mapping of directions to their corresponding x and y offsets.
 */
export const directionsMapping: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * Props for the generateTiles function.
 * @property {number} [numTiles=10] - The number of tiles to generate.
 * @property {number} [tileSize=60] - The size of each tile.
 * @property {boolean} [bossDefeated=false] - Indicates if the boss has been defeated.
 */
export interface generateTilesProps {
  numTiles: number;
  tileSize: number;
  bossDefeated: boolean;
  specials: {
    count: number;
    specialEncounter: SpecialEncounter;
  }[];
  isActivityEncounter?: boolean;
}

/**
 * Generates a set of tiles for the dungeon map.
 * @param `generateTilesProps` props - The props for generating the tiles.
 * @returns `Tile[]` - The generated tiles.
 */
export const generateTiles = ({
  numTiles = 10,
  tileSize = 60,
  bossDefeated = false,
  specials = [],
  isActivityEncounter,
}: generateTilesProps): Tile[] => {
  if (isActivityEncounter) {
    return [
      {
        x: 0,
        y: 0,
        clearedRoom: false,
        isBossRoom: false,
      },
    ];
  }
  const tiles: Tile[] = [];
  const directions = Object.values(directionsMapping);

  // Use integer coordinates during generation
  let currentX = Math.floor(Math.random() * numTiles);
  let currentY = Math.floor(Math.random() * numTiles);
  const startTile: Tile = {
    x: currentX * tileSize,
    y: currentY * tileSize,
    clearedRoom: true,
    isBossRoom: false,
  };

  const weightedDirections = [
    // favor horizontal
    directionsMapping.left,
    directionsMapping.right,
    directionsMapping.left,
    directionsMapping.right,
    directionsMapping.up,
    directionsMapping.down,
  ];

  tiles.push(startTile);

  while (tiles.length < numTiles) {
    const currentTile = tiles[Math.floor(Math.random() * tiles.length)];

    const shuffledDirections = [...weightedDirections].sort(
      () => Math.random() - 0.5,
    );

    for (const direction of shuffledDirections) {
      const newX = currentTile.x / tileSize + direction.x;
      const newY = currentTile.y / tileSize + direction.y;

      if (
        newX >= 0 &&
        newY >= 0 &&
        newX < numTiles &&
        newY < numTiles &&
        !tiles.find((t) => t.x === newX * tileSize && t.y === newY * tileSize)
      ) {
        const newTile: Tile = {
          x: newX * tileSize,
          y: newY * tileSize,
          clearedRoom: false,
          isBossRoom: false,
        };
        tiles.push(newTile);
        break;
      }
    }
  }

  if (!bossDefeated && tiles.length > 1) {
    const distanceMap = new Map<Tile, number>();
    const queue: Tile[] = [];
    queue.push(startTile);
    distanceMap.set(startTile, 0);

    while (queue.length > 0) {
      const currentTile = queue.shift()!;
      const currentDistance = distanceMap.get(currentTile)!;

      directions.forEach((direction) => {
        const newX = currentTile.x + direction.x * tileSize;
        const newY = currentTile.y + direction.y * tileSize;
        const nextTile = tiles.find((t) => t.x === newX && t.y === newY);

        if (nextTile && !distanceMap.has(nextTile)) {
          distanceMap.set(nextTile, currentDistance + 1);
          queue.push(nextTile);
        }
      });
    }

    const options = Array.from(distanceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);
    const idx = Math.floor(Math.random() * Math.min(3, options.length));
    options[idx].isBossRoom = true;
  }

  specials.forEach(({ count, specialEncounter }) => {
    const availableTiles = tiles.filter(
      (tile) => !tile.isBossRoom && !tile.specialEncounter,
    );

    for (let i = 0; i < count && availableTiles.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableTiles.length);
      availableTiles[randomIndex].specialEncounter = specialEncounter;
      availableTiles.splice(randomIndex, 1);
    }
  });

  return tiles;
};

/**
 * Gets the bounding box of a set of tiles.
 * @param {Tile[]} tiles - The tiles to get the bounding box for.
 * @param {number} tileSize - The size of each tile.
 * @returns {BoundingBox} - The bounding box of the tiles.
 */
export const getBoundingBox = (
  tiles: Tile[],
  tileSize: number,
): BoundingBox => {
  let minX = Math.min(...tiles.map((tile) => tile.x));
  let maxX = Math.max(...tiles.map((tile) => tile.x));
  let minY = Math.min(...tiles.map((tile) => tile.y));
  let maxY = Math.max(...tiles.map((tile) => tile.y));

  return {
    width: maxX - minX + tileSize,
    height: maxY - minY + tileSize,
    offsetX: minX,
    offsetY: minY,
  };
};
