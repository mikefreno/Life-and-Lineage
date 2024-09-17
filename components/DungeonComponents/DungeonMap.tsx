import { useContext } from "react";
import Svg, { Rect } from "react-native-svg";
import { Dimensions, View } from "react-native";
import GenericRaisedButton from "../GenericRaisedButton";
import { useColorScheme } from "nativewind";
import { DungeonContext, TILE_SIZE } from "./DungeonContext";
import PlatformDependantBlurView from "../PlatformDependantBlurView";
import { getEnemy, loadBoss } from "./DungeonInteriorFunctions";
import { AppContext } from "../../app/_layout";

export interface Tile {
  x: number;
  y: number;
  clearedRoom: boolean;
  isBossRoom: boolean;
}

export interface BoundingBox {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

const directionsMapping: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export interface generateTilesProps {
  numTiles: number;
  tileSize: number;
  bossDefeated: boolean;
}

export const generateTiles = ({
  numTiles = 10,
  tileSize = 60,
  bossDefeated = false,
}: generateTilesProps): Tile[] => {
  const tiles: Tile[] = [];
  const activeTiles: Tile[] = [];
  const directions = Object.values(directionsMapping);

  let currentX = Math.floor(Math.random() * Math.floor(numTiles)) * tileSize;
  let currentY = Math.floor(Math.random() * Math.floor(numTiles)) * tileSize;
  const startTile: Tile = {
    x: currentX,
    y: currentY,
    clearedRoom: true,
    isBossRoom: false,
  };

  tiles.push(startTile);
  activeTiles.push(startTile);

  for (let i = 0; i < numTiles - 1; i++) {
    const { x: currentX, y: currentY } = activeTiles[i];

    let validTileFound = false;
    let attempt = 0;

    while (!validTileFound && attempt < 50) {
      const direction =
        directions[Math.floor(Math.random() * directions.length)];
      const newX = currentX + direction.x * tileSize;
      const newY = currentY + direction.y * tileSize;

      if (
        newX >= 0 &&
        newY >= 0 &&
        !tiles.find((t) => t.x === newX && t.y === newY)
      ) {
        const newTile: Tile = {
          x: newX,
          y: newY,
          clearedRoom: false,
          isBossRoom: false,
        };
        tiles.push(newTile);
        activeTiles.push(newTile);
        validTileFound = true;
      }
      attempt++;
    }
    if (!validTileFound) {
      console.log("no valid tile found");
      activeTiles.splice(i, 1);
    }
  }

  if (!bossDefeated) {
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
    const idx = Math.floor(Math.random() * 3);
    options[idx].isBossRoom = true;
  }
  return tiles;
};

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

export const DungeonMapRender = () => {
  const dungeonData = useContext(DungeonContext);
  if (!dungeonData) throw new Error("missing context");
  const { mapDimensions, currentPosition, tiles } = dungeonData;
  const { colorScheme } = useColorScheme();
  const strokeWidth = 1;

  const getFillColor = (tile: Tile) => {
    const isCurrent =
      tile.x === currentPosition?.x && tile.y === currentPosition?.y;
    if (colorScheme == "dark") {
      if (tile.clearedRoom) {
        return isCurrent ? "#93c5fd" : "#2563eb";
      }

      //if (tile.isBossRoom) {
      //return "#dc2626";
      //}

      return isCurrent ? "#a1a1aa" : "#18181b";
    } else {
      if (tile.clearedRoom) {
        return isCurrent ? "#93c5fd" : "#2563eb";
      }

      //if (tile.isBossRoom) {
      //return "#dc2626";
      //}

      return isCurrent ? "#a1a1aa" : "#e4e4e7";
    }
  };

  const renderTile = (tile: Tile) => {
    return (
      <Rect
        key={`${tile.x}-${tile.y}`}
        x={tile.x - mapDimensions.offsetX}
        y={tile.y - mapDimensions.offsetY}
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
    ? currentPosition.x - mapDimensions.offsetX
    : 0;
  const offsetY = currentPosition
    ? currentPosition.y - mapDimensions.offsetY
    : 0;

  return (
    <View className="h-[40vh]">
      <View
        className="absolute"
        style={{
          left: xOrigin - offsetX,
          top: yOrigin - offsetY,
        }}
      >
        <Svg
          width={mapDimensions.width}
          height={mapDimensions.height}
          viewBox={`${-strokeWidth / 2} ${-strokeWidth / 2} ${
            mapDimensions.width + strokeWidth
          } ${mapDimensions.height + strokeWidth}`}
        >
          {tiles.map((tile) => renderTile(tile))}
        </Svg>
      </View>
    </View>
  );
};

export const DungeonMapControls = () => {
  const dungeonData = useContext(DungeonContext);
  const appData = useContext(AppContext);
  if (!dungeonData || !appData) throw new Error("missing context");
  const { currentPosition, setCurrentPosition, setInCombat, tiles } =
    dungeonData;
  const { dimensions } = appData;
  const isMoveValid = (direction: keyof typeof directionsMapping) => {
    if (!currentPosition) return false;

    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * TILE_SIZE;
    const newY = currentPosition.y + y * TILE_SIZE;

    const newTile = tiles.find((tile) => tile.x === newX && tile.y === newY);

    return !!newTile;
  };

  const move = (direction: keyof typeof directionsMapping) => {
    if (!currentPosition) return;
    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * TILE_SIZE;
    const newY = currentPosition.y + y * TILE_SIZE;

    const newPosition = tiles.find(
      (tile) => tile.x === newX && tile.y === newY,
    );

    if (newPosition) {
      setCurrentPosition(newPosition);
      if (!newPosition.clearedRoom) {
        if (newPosition.isBossRoom) {
          loadBoss({ appData, dungeonData });
          setInCombat(true);
        } else {
          getEnemy({ appData, dungeonData });
          setInCombat(true);
        }
      }
    }
  };

  const ArrowButton: React.FC<{
    direction: keyof typeof directionsMapping;
  }> = ({ direction }) => {
    const valid = isMoveValid(direction);
    return (
      <GenericRaisedButton
        onPressFunction={() => move(direction)}
        disabledCondition={!valid}
      >
        {direction.charAt(0).toUpperCase() + direction.slice(1)}
      </GenericRaisedButton>
    );
  };
  return (
    <PlatformDependantBlurView className="flex-1 flex items-center w-full justify-center">
      <View
        className="w-2/3 mx-auto"
        style={{ marginTop: -dimensions.height / 20 }}
      >
        <ArrowButton direction="up" />
        <View className="flex-row justify-between w-full">
          <ArrowButton direction="left" />
          <ArrowButton direction="right" />
        </View>
        <ArrowButton direction="down" />
      </View>
    </PlatformDependantBlurView>
  );
};
