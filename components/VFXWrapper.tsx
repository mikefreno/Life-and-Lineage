import { useRootStore } from "@/hooks/stores";
import { VFXImageMap } from "@/utility/vfxmapping";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { ReactNode, useEffect, useState } from "react";
import { View, Animated, Easing } from "react-native";
import { Image } from "expo-image";

export const VFXWrapper = observer(({ children }: { children: ReactNode }) => {
  const { uiStore, enemyStore, playerAnimationStore } = useRootStore();

  const [enemyAndPosList, setEnemyAndPosList] = useState<
    {
      enemyID: string;
      positionMidPoint: {
        x: number;
        y: number;
      };
    }[]
  >([]);
  const animationInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let localList = [];
    for (const enemy of enemyStore.enemies) {
      const animationStore = enemyStore.getAnimationStore(enemy.id);
      if (animationStore && animationStore.spriteMidPoint) {
        localList.push({
          enemyID: enemy.id,
          positionMidPoint: animationStore.spriteMidPoint,
        });
      }
    }
    setEnemyAndPosList(localList);
  }, [enemyStore.enemies]);

  return (
    <View style={{ flex: 1 }}>
      {/* Debug dots */}
      {__DEV__ && uiStore.showDevDebugUI && (
        <>
          {enemyAndPosList.map((elem) => (
            <View
              key={`enemy-dot-${elem.enemyID}`}
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "red",
                top: elem.positionMidPoint.y,
                left: elem.positionMidPoint.x,
                zIndex: 9999,
              }}
            />
          ))}
          <View
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "green",
              top: playerAnimationStore.playerOrigin.y,
              left: playerAnimationStore.playerOrigin.x,
              zIndex: 9999,
            }}
          />
        </>
      )}

      {children}
    </View>
  );
});
