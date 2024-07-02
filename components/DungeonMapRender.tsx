import React, { useEffect, useState } from "react";
import Svg, { Rect } from "react-native-svg";
import { View } from "react-native";
import { View as ThemedView } from "./Themed";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import GenericRaisedButton from "./GenericRaisedButton";

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

interface MapGeneratorProps {
  tiles: Tile[];
  mapDimensions: BoundingBox;
  tileSize: number;
  currentPosition: Tile | null;
  setCurrentPosition: React.Dispatch<React.SetStateAction<Tile | null>>;
  setInCombat: React.Dispatch<React.SetStateAction<boolean>>;
  loadBoss: () => void;
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
}

export const generateTiles = ({
  numTiles,
  tileSize,
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
          isBossRoom: i == numTiles - 2,
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

export default function DungeonMapRender({
  tiles,
  mapDimensions,
  tileSize,
  currentPosition,
  setCurrentPosition,
  setInCombat,
  loadBoss,
}: MapGeneratorProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

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
      if (newPosition.isBossRoom) {
        loadBoss();
      } else {
        setInCombat(true);
      }
    }
  };

  const renderTile = (tile: Tile) => {
    const isCurrent =
      tile.x === currentPosition?.x && tile.y === currentPosition?.y;
    return (
      <Rect
        key={`${tile.x}-${tile.y}`}
        x={tile.x - mapDimensions.offsetX}
        y={tile.y - mapDimensions.offsetY}
        width={tileSize}
        height={tileSize}
        fill={
          tile.clearedRoom
            ? isCurrent
              ? "#93c5fd"
              : "#2563eb"
            : tile.isBossRoom
            ? "#dc2626"
            : isCurrent
            ? "gray"
            : "black"
        }
        stroke="gray"
      />
    );
  };

  const isMoveValid = (direction: keyof typeof directionsMapping) => {
    if (!currentPosition) return false;
    if (!currentPosition.clearedRoom) return false;
    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * tileSize;
    const newY = currentPosition.y + y * tileSize;

    return tiles.some((tile) => tile.x === newX && tile.y === newY);
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
    <ThemedView className="h-full">
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
      <View className="flex-1 flex items-center w-2/3 mx-auto">
        <ArrowButton direction="up" />
        <View className="flex-row justify-between w-full">
          <ArrowButton direction="left" />
          <ArrowButton direction="right" />
        </View>
        <ArrowButton direction="down" />
      </View>
    </ThemedView>
  );
}
