import Svg, { Rect } from "react-native-svg";
import { Dimensions, View } from "react-native";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { TILE_SIZE } from "@/stores/DungeonStore";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { directionsMapping, Tile } from "@/utility/functions/dungeon";
import { useScaling } from "@/hooks/scaling";

/**
 * Renders the dungeon map made by `generateTiles`.
 */
export const DungeonMapRender = observer(() => {
  const strokeWidth = 1;
  const { dungeonStore, uiStore } = useRootStore();
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
    if (uiStore.colorScheme == "dark") {
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
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
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
  const styles = useStyles();
  const { getNormalizedFontSize } = useScaling();

  if (!dungeonStore.currentPosition || !dungeonStore.currentMap) {
    throw new Error("Missing map, or current position within control handler!");
  }

  const isMoveValid = (direction: "up" | "down" | "left" | "right") => {
    if (!dungeonStore.currentPosition || !dungeonStore.currentMap) return false;

    const { x, y } = directionsMapping[direction];
    const newX = dungeonStore.currentPosition.x + x * TILE_SIZE;
    const newY = dungeonStore.currentPosition.y + y * TILE_SIZE;

    const newTile = dungeonStore.currentMap.find(
      (tile) => tile.x === newX && tile.y === newY,
    );

    return !!newTile;
  };

  /**
   * UI Button to move the player, if a move is invalid(past the edge of the map) that direction will be disabled
   * @param direction - the direction ("up", "down", "left", "right") to render and check for move validity
   */
  const ArrowButton = ({
    direction,
  }: {
    direction: "up" | "down" | "left" | "right";
  }) => {
    const valid = isMoveValid(direction);
    return (
      <GenericRaisedButton
        key={direction}
        onPress={() => dungeonStore.move(direction)}
        disabled={!valid || dungeonStore.movementQueued}
        style={{ width: getNormalizedFontSize(100) }}
      >
        {direction.charAt(0).toUpperCase() + direction.slice(1)}
      </GenericRaisedButton>
    );
  };

  if (uiStore.dimensions.height < 500) {
    return (
      <View
        style={{
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: "space-evenly",
          flexDirection: "row",
        }}
      >
        <ArrowButton direction="up" />
        <ArrowButton direction="left" />
        {dungeonStore.currentPosition.specialEncounter &&
          !dungeonStore.currentPosition.specialEncounter.activated && (
            <GenericRaisedButton
              backgroundColor="#2563eb"
              buttonStyle={{ paddingHorizontal: 8 }}
              onPress={() =>
                dungeonStore.setCurrentSpecialEncounter(
                  dungeonStore.currentPosition!.specialEncounter!,
                )
              }
            >
              Enter
            </GenericRaisedButton>
          )}
        <ArrowButton direction="right" />
        <ArrowButton direction="down" />
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <ArrowButton direction="up" />
      <View style={styles.arrowButtonRow}>
        <ArrowButton direction="left" />
        {dungeonStore.currentPosition.specialEncounter &&
          !dungeonStore.currentPosition.specialEncounter.activated && (
            <GenericRaisedButton
              backgroundColor="#2563eb"
              buttonStyle={{ paddingHorizontal: 8 }}
              onPress={() =>
                dungeonStore.setCurrentSpecialEncounter(
                  dungeonStore.currentPosition!.specialEncounter!,
                )
              }
            >
              Enter
            </GenericRaisedButton>
          )}
        <ArrowButton direction="right" />
      </View>
      <ArrowButton direction="down" />
    </View>
  );
});
