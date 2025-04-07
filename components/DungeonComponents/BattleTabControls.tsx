import { View, Pressable, Animated } from "react-native";
import { Text } from "@/components/Themed";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { useMemo, useState, useEffect } from "react";
import { useScaling } from "@/hooks/scaling";
import { observer } from "mobx-react-lite";

interface BattleTabControlsProps {
  battleTab: string;
  setBattleTab: (
    value: React.SetStateAction<
      "attacksOrNavigation" | "equipment" | "log" | "minions"
    >,
  ) => void;
}

const BattleTabControls = observer(
  ({ battleTab, setBattleTab }: BattleTabControlsProps) => {
    const styles = useStyles();
    const vibration = useVibration();
    const { dungeonStore, uiStore, playerState } = useRootStore();
    const { getNormalizedSize } = useScaling();
    const [storedHealthMap, setStoredHealthMap] = useState<
      Map<
        string,
        {
          health: number;
          turnsLeftAlive: number;
        }
      >
    >(new Map());

    const minionFlashValue = useState(new Animated.Value(0))[0];

    const getBackgroundColor = (
      tab: "attacksOrNavigation" | "equipment" | "log" | "minions",
    ) => ({
      backgroundColor: battleTab === tab ? "rgba(39, 39, 42, 0.5)" : undefined,
    });

    const minionFlashInterpolation = minionFlashValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        getBackgroundColor("minions").backgroundColor ?? "transparent",
        "rgba(180,30,30,0.4)",
      ],
    });

    const flashMinionTab = () => {
      Animated.sequence([
        Animated.timing(minionFlashValue, {
          toValue: 1,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.delay(100),
        Animated.timing(minionFlashValue, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        }),
      ]).start();
    };

    useEffect(() => {
      if (playerState && playerState.minionsAndPets.length > 0) {
        if (storedHealthMap.size > 0) {
          for (const [k, v] of storedHealthMap) {
            const minionInQuestion = playerState.minonsAndPetsHealthMap.get(k);
            if (!minionInQuestion && v.turnsLeftAlive > 1) {
              flashMinionTab();
            } else if (!minionInQuestion) {
            } else if (minionInQuestion?.health < v.health) {
              flashMinionTab();
            }
          }
        }

        setStoredHealthMap(playerState.minonsAndPetsHealthMap);
      }
    }, [playerState?.minonsAndPetsHealthMap]);

    const attacksOrNavigationStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              flex: 1,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center" as const,
              ...getBackgroundColor("attacksOrNavigation"),
            } as const)
          : ({
              flex: 1,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("attacksOrNavigation"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    const equipmentStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              flex: 1,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center",
              ...getBackgroundColor("equipment"),
            } as const)
          : ({
              flex: 1,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("equipment"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    const logStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              flex: 1,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center",
              ...getBackgroundColor("log"),
            } as const)
          : ({
              flex: 1,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("log"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    return (
      <View style={[styles.battleTabControls]}>
        <Pressable
          style={attacksOrNavigationStyle}
          onPress={() => {
            vibration({ style: "light" });
            setBattleTab("attacksOrNavigation");
          }}
        >
          <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
            {dungeonStore.inCombat ? "Attacks" : "Navigation"}
          </Text>
        </Pressable>
        <Pressable
          style={equipmentStyle}
          onPress={() => {
            vibration({ style: "light" });
            setBattleTab("equipment");
          }}
        >
          <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
            Inventory
          </Text>
        </Pressable>
        {playerState && playerState.minionsAndPets.length > 0 && (
          <Animated.View
            style={[
              { backgroundColor: minionFlashInterpolation, flex: 1 },
              uiStore.isLandscape
                ? {
                    paddingHorizontal: getNormalizedSize(10),
                    justifyContent: "center",
                  }
                : {
                    paddingVertical: getNormalizedSize(10),
                  },
            ]}
          >
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setBattleTab("minions");
              }}
            >
              <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
                Minions
              </Text>
            </Pressable>
          </Animated.View>
        )}
        <Pressable
          style={logStyle}
          onPress={() => {
            vibration({ style: "light" });
            setBattleTab("log");
          }}
        >
          <Text
            style={{
              textAlign: "center",
              ...styles["text-lg"],
            }}
          >
            Log
          </Text>
        </Pressable>
      </View>
    );
  },
);

export default BattleTabControls;
