import { useContext } from "react";
import Svg, { Rect } from "react-native-svg";
import { Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import GenericRaisedButton from "../GenericRaisedButton";
import { useColorScheme } from "nativewind";
import { DungeonContext, TILE_SIZE } from "./DungeonContext";
import Draggable from "react-native-draggable";
import { View as ThemedView } from "../Themed";
import { BlurView } from "expo-blur";
import PlatformDependantBlurView from "../PlatformDependantBlurView";
import { useVibration } from "../../utility/customHooks";

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
  const strokeWidth = 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const vibrate = useVibration();

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
        strokeWidth={strokeWidth}
      />
    );
  };

  return (
    <View className="flex h-1/2">
      <Draggable
        x={Dimensions.get("screen").width / 4}
        y={20}
        minX={TILE_SIZE - mapDimensions.width}
        maxX={Dimensions.get("screen").width + mapDimensions.width - TILE_SIZE}
        minY={TILE_SIZE - mapDimensions.height}
        maxY={Dimensions.get("screen").height / 2 + mapDimensions.height / 2}
        onPressIn={() => vibrate({ style: "medium" })}
      >
        <Animated.View
          style={[
            animatedStyle,
            { width: mapDimensions.width, height: mapDimensions.height },
          ]}
        >
          <Svg
            width={mapDimensions.width}
            height={mapDimensions.height}
            viewBox={`${-strokeWidth / 2} ${-strokeWidth / 2} ${
              mapDimensions.width + strokeWidth
            } ${mapDimensions.height + strokeWidth}`} // corrective to include map edge borders
          >
            {tiles.map((tile) => renderTile(tile))}
          </Svg>
        </Animated.View>
      </Draggable>
    </View>
  );
};

interface DungeonMapControlsProps {
  tileSize: number;
  loadBoss: () => void;
  getEnemy: () => void;
}

export const DungeonMapControls = ({
  tileSize,
  loadBoss,
  getEnemy,
}: DungeonMapControlsProps) => {
  const dungeonData = useContext(DungeonContext);
  if (!dungeonData) throw new Error("missing context");
  const { currentPosition, setCurrentPosition, setInCombat, tiles } =
    dungeonData;
  const isMoveValid = (direction: keyof typeof directionsMapping) => {
    if (!currentPosition) return false;

    const { x, y } = directionsMapping[direction];
    const newX = currentPosition.x + x * tileSize;
    const newY = currentPosition.y + y * tileSize;

    const newTile = tiles.find((tile) => tile.x === newX && tile.y === newY);

    return !!newTile;
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
          setInCombat(true);
        } else {
          getEnemy();
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
    <PlatformDependantBlurView className="flex-1 flex items-center w-full">
      <View className="w-2/3 mx-auto">
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
