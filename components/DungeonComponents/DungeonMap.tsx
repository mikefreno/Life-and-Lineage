import Svg, { Rect } from "react-native-svg";
import { Dimensions, View } from "react-native";
import GenericRaisedButton from "../GenericRaisedButton";
import { useColorScheme } from "nativewind";
import { TILE_SIZE } from "../../stores/DungeonStore";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../hooks/stores";
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
const directionsMapping: Record<string, { x: number; y: number }> = {
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

  const weightedDirections = [
    directionsMapping.left,
    directionsMapping.right,
    directionsMapping.left, // Add extra horizontal directions
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

/**
 * Renders the dungeon map made by `generateTiles`.
 */
export const DungeonMapRender = observer(() => {
  const { colorScheme } = useColorScheme();
  const strokeWidth = 1;
  const { dungeonStore } = useRootStore();
  const { currentMapDimensions, currentMap, currentPosition } = dungeonStore;

  if (!currentMapDimensions || !currentMap) {
    throw new Error("Missing map, or map dimensions within map render!");
  }
  /**
   * Gets the fill color for a tile based on its state and the color scheme.
   * @param {Tile} tile - The tile to get the fill color for.
   * @returns {string} - The fill color for the tile.
   */
  const getFillColor = (tile: Tile) => {
    const isCurrent =
      tile.x === currentPosition?.x && tile.y === currentPosition?.y;
    if (tile.isBossRoom && tile.clearedRoom) {
      return isCurrent ? "#DBA56E" : "#8B4513";
    }
    if (colorScheme == "dark") {
      if (tile.clearedRoom) {
        return isCurrent ? "#93c5fd" : "#2563eb";
      }
      return isCurrent ? "#a1a1aa" : "#18181b";
    } else {
      if (tile.clearedRoom) {
        return isCurrent ? "#93c5fd" : "#2563eb";
      }
      return isCurrent ? "#a1a1aa" : "#e4e4e7";
    }
  };

  /**
   * Renders a single tile.
   * @param {Tile} tile - The tile to render.
   * @returns {JSX.Element} - The rendered tile.
   */
  const renderTile = (tile: Tile) => {
    return (
      <Rect
        key={`${tile.x}-${tile.y}`}
        x={tile.x - currentMapDimensions.offsetX}
        y={tile.y - currentMapDimensions.offsetY}
        width={TILE_SIZE}
        height={TILE_SIZE}
        fill={getFillColor(tile)}
        stroke="gray"
        strokeWidth={strokeWidth}
      />
    );
  };

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  // Position of the map's top left piece
  const xOrigin = windowWidth / 2 - TILE_SIZE / 2;
  const yOrigin = windowHeight * 0.2 - TILE_SIZE / 2;
  // Distance from map's top left piece
  const offsetX = currentPosition
    ? currentPosition.x - currentMapDimensions.offsetX
    : 0;
  const offsetY = currentPosition
    ? currentPosition.y - currentMapDimensions.offsetY
    : 0;

  return (
    <View className="flex-1">
      <View
        className="absolute"
        style={{
          left: xOrigin - offsetX,
          top: yOrigin - offsetY,
        }}
      >
        <Svg
          width={currentMapDimensions.width}
          height={currentMapDimensions.height}
          viewBox={`${-strokeWidth / 2} ${-strokeWidth / 2} ${
            currentMapDimensions.width + strokeWidth
          } ${currentMapDimensions.height + strokeWidth}`}
        >
          {currentMap.map((tile) => renderTile(tile))}
        </Svg>
      </View>
    </View>
  );
});

/**
 * Renders the controls for moving around the dungeon.
 */
export const DungeonMapControls = observer(() => {
  const { dungeonStore, uiStore } = useRootStore();
  const { currentPosition, currentMap, movementQueued } = dungeonStore;

  if (!currentPosition || !currentMap) {
    throw new Error("Missing map, or current position within control handler!");
  }

  const isMoveValid = (direction: "up" | "down" | "left" | "right") => {
    if (!currentPosition) return false;

    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * TILE_SIZE;
    const newY = currentPosition.y + y * TILE_SIZE;

    const newTile = currentMap.find(
      (tile) => tile.x === newX && tile.y === newY,
    );

    return !!newTile;
  };

  /**
   * UI Button to move the player, if a move is invalid(past the edge of the map) that direction will be disabled
   * @param direction - the direction ("up", "down", "left", "right") to render and check for move validity
   */
  const ArrowButton: React.FC<{
    direction: "up" | "down" | "left" | "right";
  }> = ({ direction }) => {
    const valid = isMoveValid(direction);
    return (
      <GenericRaisedButton
        key={direction}
        onPress={() => dungeonStore.move(direction)}
        disabled={!valid || movementQueued}
      >
        {direction.charAt(0).toUpperCase() + direction.slice(1)}
      </GenericRaisedButton>
    );
  };
  return (
    <View className="flex-1 flex items-center w-full justify-center">
      <View
        className="w-2/3 mx-auto"
        style={{ marginTop: -uiStore.dimensions.height / 20 }}
      >
        <ArrowButton direction="up" />
        <View className="flex-row justify-between w-full">
          <ArrowButton direction="left" />
          <ArrowButton direction="right" />
        </View>
        <ArrowButton direction="down" />
      </View>
    </View>
  );
});
