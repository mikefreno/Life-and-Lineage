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

  // Generate map without a starting position
  const tiles: Tile[] = [];
  const directions = Object.values(directionsMapping);

  // Use integer coordinates during generation
  let currentX = Math.floor(Math.random() * numTiles);
  let currentY = Math.floor(Math.random() * numTiles);
  const initialTile: Tile = {
    x: currentX * tileSize,
    y: currentY * tileSize,
    clearedRoom: false,
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

  tiles.push(initialTile);

  // Generate exactly numTiles tiles (not counting the starting position)
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

  // Find tiles that would make good entry points (tiles with only one neighbor)
  const entryPointCandidates = [];

  for (const tile of tiles) {
    // For each tile, check how many neighbors it has
    let neighborCount = 0;
    let neighborDirection = null;

    for (const dir of directions) {
      const neighborX = tile.x + dir.x * tileSize;
      const neighborY = tile.y + dir.y * tileSize;

      if (tiles.some((t) => t.x === neighborX && t.y === neighborY)) {
        neighborCount++;
        neighborDirection = dir;
      }
    }

    // If this tile has exactly one neighbor, it's a good entry point
    if (neighborCount === 1 && neighborDirection) {
      entryPointCandidates.push({
        tile,
        neighborDirection,
      });
    }
  }

  // If no good entry points found, find tiles with two neighbors
  if (entryPointCandidates.length === 0) {
    for (const tile of tiles) {
      let neighborCount = 0;
      let openDirections = [];

      for (const dir of directions) {
        const neighborX = tile.x + dir.x * tileSize;
        const neighborY = tile.y + dir.y * tileSize;

        if (tiles.some((t) => t.x === neighborX && t.y === neighborY)) {
          neighborCount++;
        } else {
          openDirections.push(dir);
        }
      }

      if (neighborCount === 2 && openDirections.length > 0) {
        entryPointCandidates.push({
          tile,
          neighborDirection:
            openDirections[Math.floor(Math.random() * openDirections.length)],
        });
      }
    }
  }

  // If still no candidates, use any tile with an open direction
  if (entryPointCandidates.length === 0) {
    for (const tile of tiles) {
      const openDirections = directions.filter((dir) => {
        const neighborX = tile.x + dir.x * tileSize;
        const neighborY = tile.y + dir.y * tileSize;

        return !tiles.some((t) => t.x === neighborX && t.y === neighborY);
      });

      if (openDirections.length > 0) {
        entryPointCandidates.push({
          tile,
          neighborDirection:
            openDirections[Math.floor(Math.random() * openDirections.length)],
        });
      }
    }
  }

  // Choose a random entry point
  const chosenEntry =
    entryPointCandidates[
      Math.floor(Math.random() * entryPointCandidates.length)
    ];

  // Create the starting tile in the opposite direction of the neighbor
  const oppositeDirection = {
    x: -chosenEntry.neighborDirection.x,
    y: -chosenEntry.neighborDirection.y,
  };

  const startTile: Tile = {
    x: chosenEntry.tile.x + oppositeDirection.x * tileSize,
    y: chosenEntry.tile.y + oppositeDirection.y * tileSize,
    clearedRoom: true,
    isBossRoom: false,
  };

  // Verify that the starting tile only touches one other tile
  let touchCount = 0;
  for (const dir of directions) {
    const neighborX = startTile.x + dir.x * tileSize;
    const neighborY = startTile.y + dir.y * tileSize;

    if (tiles.some((t) => t.x === neighborX && t.y === neighborY)) {
      touchCount++;
    }
  }

  // If the starting tile would touch more than one tile, try another approach
  if (touchCount > 1) {
    // Find any tile with at least one open direction
    const edgeTiles = tiles.filter((tile) => {
      return directions.some((dir) => {
        const neighborX = tile.x + dir.x * tileSize;
        const neighborY = tile.y + dir.y * tileSize;
        return !tiles.some((t) => t.x === neighborX && t.y === neighborY);
      });
    });

    if (edgeTiles.length > 0) {
      const randomEdgeTile =
        edgeTiles[Math.floor(Math.random() * edgeTiles.length)];

      // Find all open directions from this tile
      const openDirections = directions.filter((dir) => {
        const neighborX = randomEdgeTile.x + dir.x * tileSize;
        const neighborY = randomEdgeTile.y + dir.y * tileSize;

        // Check that this direction doesn't lead to another tile
        if (tiles.some((t) => t.x === neighborX && t.y === neighborY)) {
          return false;
        }

        // Also check that placing a tile here wouldn't touch other tiles
        let wouldTouchOthers = false;
        for (const checkDir of directions) {
          if (checkDir.x === -dir.x && checkDir.y === -dir.y) continue; // Skip the direction back to our edge tile

          const checkX = neighborX + checkDir.x * tileSize;
          const checkY = neighborY + checkDir.y * tileSize;

          if (tiles.some((t) => t.x === checkX && t.y === checkY)) {
            wouldTouchOthers = true;
            break;
          }
        }

        return !wouldTouchOthers;
      });

      if (openDirections.length > 0) {
        const chosenDir =
          openDirections[Math.floor(Math.random() * openDirections.length)];
        startTile.x = randomEdgeTile.x + chosenDir.x * tileSize;
        startTile.y = randomEdgeTile.y + chosenDir.y * tileSize;
      }
    }
  }

  // Add the starting tile to the beginning of the array
  tiles.unshift(startTile);

  // Place boss room (if needed) after the starting room is added
  if (!bossDefeated && tiles.length > 1) {
    // Calculate distances from starting tile to all other tiles
    const distancesFromStart = tiles.map((tile, index) => {
      if (index === 0) return { tile, distance: 0, index }; // Starting tile

      // Calculate path distance (not just Euclidean)
      // This is a simplified approach - in a real game you might want to use pathfinding
      const dx = Math.abs(tile.x - startTile.x) / tileSize;
      const dy = Math.abs(tile.y - startTile.y) / tileSize;
      const distance = dx + dy; // Manhattan distance as a simple approximation

      return { tile, distance, index };
    });

    // Sort by distance (descending)
    distancesFromStart.sort((a, b) => b.distance - a.distance);

    // Find tiles that are at least 5 units away from start
    const farTiles = distancesFromStart.filter((item) => item.distance >= 5);

    if (farTiles.length > 0) {
      // Choose one of the far tiles randomly for the boss room
      const chosenBossTile =
        farTiles[Math.floor(Math.random() * farTiles.length)];
      tiles[chosenBossTile.index].isBossRoom = true;
    } else {
      // If no tiles are far enough, choose the farthest one
      tiles[distancesFromStart[0].index].isBossRoom = true;
    }
  }

  // Place special encounters
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
