import React, { useMemo } from "react";
import { View } from "react-native";
import { observer } from "mobx-react-lite";

import { useDraggableStore } from "@/hooks/stores";
import { Text } from "@/components/Themed";

const BoundsVisualizer = observer(() => {
  const { draggableClassStore } = useDraggableStore();

  const ancillaryBoundsEntries = Array.from(
    draggableClassStore.ancillaryBoundsMap.entries(),
  );

  const inventoryBounds = draggableClassStore.inventoryBounds
    ? [["inventory", draggableClassStore.inventoryBounds]]
    : [];

  const allBounds = [...ancillaryBoundsEntries, ...inventoryBounds];

  const boundColors = useMemo(() => {
    return allBounds.reduce(
      (colors, [key]) => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        // Create fill and border colors
        colors[key] = {
          fill: `rgba(${r}, ${g}, ${b}, 0.3)`,
          border: `rgba(${r}, ${g}, ${b}, 0.8)`,
        };

        return colors;
      },
      {} as Record<string, { fill: string; border: string }>,
    );
  }, [allBounds.length]); // Only regenerate if number of bounds changes

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 9999, // Ensure it's on top of everything
      }}
    >
      {allBounds.map(([key, bounds]) => {
        if (!bounds) return null;

        const colors = boundColors[key] || {
          fill: "rgba(200, 200, 200, 0.3)",
          border: "rgba(200, 200, 200, 0.8)",
        };

        return (
          <View
            key={key}
            style={{
              position: "absolute",
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
              backgroundColor: colors.fill,
              borderWidth: 2,
              borderColor: colors.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "black",
                fontWeight: "bold",
                fontSize: normalize(10),
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: 4,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {key}
              {"\n"}
              {`${Math.round(bounds.x)},${Math.round(bounds.y)}`}
              {"\n"}
              {`${Math.round(bounds.width)}×${Math.round(bounds.height)}`}
            </Text>
          </View>
        );
      })}

      {/* Display count of bounds */}
      <View
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: 8,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 12 }}>
          Bounds: {allBounds.filter(([_, b]) => b !== null).length}
        </Text>
      </View>
    </View>
  );
});

export default BoundsVisualizer;
