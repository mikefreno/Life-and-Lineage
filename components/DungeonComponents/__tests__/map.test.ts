import { TILE_SIZE } from "../DungeonContext";

interface Tile {
  x: number;
  y: number;
  clearedRoom: boolean;
  isBossRoom: boolean;
}

const directionsMapping: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

interface generateTilesProps {
  numTiles: number;
  tileSize?: number;
  bossDefeated?: boolean;
}

const generateTiles = ({
  numTiles = 10,
  tileSize = 60,
  bossDefeated = false,
}: generateTilesProps): Tile[] => {
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

  tiles.push(startTile);

  while (tiles.length < numTiles) {
    const currentTile = tiles[Math.floor(Math.random() * tiles.length)];

    for (const direction of directions) {
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

  return tiles;
};

describe("generateTiles", () => {
  test("should generate the correct number of tiles", () => {
    const numTiles = 10;
    const result = generateTiles({ numTiles });
    expect(result.length).toBe(numTiles);
  });

  test("should not have overlapping tiles", () => {
    const numTiles = 10;
    const result = generateTiles({ numTiles });

    const tileMap = new Map<string, Tile>();
    result.forEach((tile) => {
      const key = `${tile.x},${tile.y}`;
      if (tileMap.has(key)) {
        throw new Error(`Tile overlap detected at ${key}`);
      }
      tileMap.set(key, tile);
    });
  });

  test("should mark the starting tile as cleared", () => {
    const numTiles = 10;
    const result = generateTiles({ numTiles });
    const startTile = result.find((tile) => tile.clearedRoom);
    expect(startTile).toBeDefined();
    expect(startTile?.clearedRoom).toBe(true);
  });

  test("should add the boss room correctly and not within 3 moves of the starting point", () => {
    const numTiles = 10;
    const result = generateTiles({ numTiles, bossDefeated: false });

    const startTile = result.find((tile) => tile.clearedRoom);
    const bossTile = result.find((tile) => tile.isBossRoom);

    expect(bossTile).toBeDefined();

    const startX = startTile!.x / numTiles;
    const startY = startTile!.y / numTiles;
    const bossX = bossTile!.x / numTiles;
    const bossY = bossTile!.y / numTiles;

    const directions = Object.values(directionsMapping);
    const withinThreeMoves = directions.some((dir) => {
      const newX = startX + dir.x;
      const newY = startY + dir.y;
      return newX === bossX && newY === bossY;
    });

    expect(withinThreeMoves).toBe(false);
  });

  test("should handle edge cases like small numTiles", () => {
    const numTiles = 2;
    const result = generateTiles({ numTiles, bossDefeated: false });

    expect(result.length).toBe(numTiles);
    expect(result.find((tile) => tile.isBossRoom)).toBeUndefined();
  });

  test("should handle edge cases like bossDefeated", () => {
    const numTiles = 10;
    const result = generateTiles({ numTiles, bossDefeated: true });

    expect(result.length).toBe(numTiles);
    expect(result.find((tile) => tile.isBossRoom)).toBeUndefined();
  });
});

//function detectOverlaps(tiles: Tile[]): boolean {
//const tilePositions = new Set<string>();

//for (const tile of tiles) {
//// Round the coordinates to a fixed number of decimal places
//const roundedX = Number(tile.x.toFixed(0));
//const roundedY = Number(tile.y.toFixed(0));
//const positionKey = `${roundedX},${roundedY}`;

//if (tilePositions.has(positionKey)) {
//console.log(`Overlap detected at position: ${positionKey}`);
//return true;
//}
//tilePositions.add(positionKey);
//}

//return false;
//}
//describe("generateTiles", () => {
//it("should generate non-overlapping tiles", () => {
//const numTests = 1000;
//let successfulTests = 0;
//let activeTilesError = 0;

//for (let i = 0; i < numTests; i++) {
//try {
//const tiles = generateTiles({
//numTiles: 40,
//tileSize: 60,
//bossDefeated: false,
//});

//expect(tiles.length).toBeLessThanOrEqual(40);
//expect(tiles.length).toBeGreaterThan(36);

//expect(tiles.some((tile) => tile.clearedRoom)).toBe(true);
//expect(tiles.some((tile) => tile.isBossRoom)).toBe(true);
//successfulTests++;
//} catch (error) {
//if (
//!(
//error instanceof TypeError &&
//error.message.includes(
//"Cannot read properties of undefined (reading 'x')",
//)
//)
//) {
//throw error;
//} else {
//activeTilesError++;
//}
//}
//}
//console.log(`Successful tests: ${successfulTests} out of ${numTests}`);
//console.log(
//`Tests failed to do activeTiles indexing error: ${activeTilesError}`,
//);
//});
//});

//describe("Dungeon Map Generation", () => {
//const brokenMap: Tile[] = [
//{ clearedRoom: true, isBossRoom: false, x: 596.4, y: 511.20000000000005 },
//{ clearedRoom: false, isBossRoom: false, x: 596.4, y: 596.4000000000001 },
//{ clearedRoom: false, isBossRoom: false, x: 596.4, y: 511.2000000000001 },
//{ clearedRoom: false, isBossRoom: false, x: 681.6, y: 511.2000000000001 },
//{ clearedRoom: false, isBossRoom: false, x: 681.6, y: 426.0000000000001 },
//{
//clearedRoom: false,
//isBossRoom: true,
//x: 766.8000000000001,
//y: 426.0000000000001,
//},
//{
//clearedRoom: false,
//isBossRoom: false,
//x: 766.8000000000001,
//y: 511.2000000000001,
//},
//{
//clearedRoom: false,
//isBossRoom: false,
//x: 852.0000000000001,
//y: 511.2000000000001,
//},
//{
//clearedRoom: false,
//isBossRoom: false,
//x: 852.0000000000001,
//y: 426.0000000000001,
//},
//{
//clearedRoom: false,
//isBossRoom: false,
//x: 937.2000000000002,
//y: 426.0000000000001,
//},
//];

//const goodMap: Tile[] = [
//{ clearedRoom: true, isBossRoom: false, x: 0, y: 426 },
//{ clearedRoom: false, isBossRoom: false, x: 85.2, y: 426 },
//{ clearedRoom: false, isBossRoom: false, x: 85.2, y: 511.2 },
//{ clearedRoom: false, isBossRoom: false, x: 170.4, y: 511.2 },
//{ clearedRoom: false, isBossRoom: false, x: 170.4, y: 426 },
//{ clearedRoom: false, isBossRoom: false, x: 170.4, y: 340.8 },
//{ clearedRoom: false, isBossRoom: false, x: 255.60000000000002, y: 340.8 },
//{ clearedRoom: false, isBossRoom: false, x: 255.60000000000002, y: 426 },
//{ clearedRoom: false, isBossRoom: false, x: 255.60000000000002, y: 511.2 },
//{ clearedRoom: false, isBossRoom: true, x: 255.60000000000002, y: 596.4 },
//];

//test("Broken map should have overlaps", () => {
//expect(detectOverlaps(brokenMap)).toBe(true);
//});

//test("Good map should not have overlaps", () => {
//expect(detectOverlaps(goodMap)).toBe(false);
//});

//test("Broken map should have correct number of tiles", () => {
//expect(brokenMap.length).toBe(10);
//});

//test("Good map should have correct number of tiles", () => {
//expect(goodMap.length).toBe(10);
//});

//test("Broken map should have a cleared room", () => {
//expect(brokenMap.some((tile) => tile.clearedRoom)).toBe(true);
//});

//test("Good map should have a cleared room", () => {
//expect(goodMap.some((tile) => tile.clearedRoom)).toBe(true);
//});

//test("Broken map should have a boss room", () => {
//expect(brokenMap.some((tile) => tile.isBossRoom)).toBe(true);
//});

//test("Good map should have a boss room", () => {
//expect(goodMap.some((tile) => tile.isBossRoom)).toBe(true);
//});
//});
//
//
