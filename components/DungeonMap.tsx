import React from "react";
import Svg, { Rect } from "react-native-svg";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import GenericRaisedButton from "./GenericRaisedButton";
import { useColorScheme } from "nativewind";
import Draggable from "react-native-draggable";

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
  numTiles,
  tileSize,
  bossDefeated,
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

    while (!validTileFound && attempt < 10) {
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

interface MapGeneratorProps {
  tiles: Tile[];
  mapDimensions: BoundingBox;
  tileSize: number;
  currentPosition: Tile | null;
}

export const DungeonMapRender = ({
  tiles,
  mapDimensions,
  tileSize,
  currentPosition,
}: MapGeneratorProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const { colorScheme } = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

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
        width={tileSize}
        height={tileSize}
        fill={getFillColor(tile)}
        stroke="gray"
      />
    );
  };

  return (
    <View className="flex h-1/2 mx-auto justify-center">
      <Animated.View
        style={[
          animatedStyle,
          { width: mapDimensions.width, height: mapDimensions.height },
        ]}
      >
        <Svg width={mapDimensions.width} height={mapDimensions.height}>
          {tiles.map((tile) => renderTile(tile))}
        </Svg>
      </Animated.View>
    </View>
  );
};

interface DungeonMapControlsProps {
  tiles: Tile[];
  currentPosition: Tile | null;
  tileSize: number;
  setCurrentPosition: React.Dispatch<React.SetStateAction<Tile | null>>;
  setInCombat: React.Dispatch<React.SetStateAction<boolean>>;
  loadBoss: () => void;
}

export const DungeonMapControls = ({
  tiles,
  currentPosition,
  tileSize,
  setCurrentPosition,
  setInCombat,
  loadBoss,
}: DungeonMapControlsProps) => {
  const isMoveValid = (direction: keyof typeof directionsMapping) => {
    if (!currentPosition) return false;
    if (!currentPosition.clearedRoom) return false;
    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * tileSize;
    const newY = currentPosition.y + y * tileSize;

    return tiles.some((tile) => tile.x === newX && tile.y === newY);
  };

  const move = (direction: keyof typeof directionsMapping) => {
    if (!currentPosition) return;
    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * tileSize;
    const newY = currentPosition.y + y * tileSize;

    const newPosition = tiles.find(
      (tile) => tile.x === newX && tile.y === newY,
    );

    if (newPosition) {
      setCurrentPosition(newPosition);
      if (!newPosition.clearedRoom) {
        if (newPosition.isBossRoom) {
          loadBoss();
        } else {
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
        text={direction.charAt(0).toUpperCase() + direction.slice(1)}
        disabledCondition={!valid}
      />
    );
  };
  return (
    <View className="flex-1 flex items-center w-2/3 mx-auto">
      <ArrowButton direction="up" />
      <View className="flex-row justify-between w-full">
        <ArrowButton direction="left" />
        <ArrowButton direction="right" />
      </View>
      <ArrowButton direction="down" />
    </View>
  );
};
