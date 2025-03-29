import { View, Pressable, DimensionValue } from "react-native";
import { Text } from "@/components/Themed";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { useMemo } from "react";
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

    const getBackgroundColor = (
      tab: "attacksOrNavigation" | "equipment" | "log" | "minions",
    ) => ({
      backgroundColor: battleTab === tab ? "rgba(39, 39, 42, 0.5)" : undefined,
    });

    const tabsSize =
      playerState && playerState.minionsAndPets.length > 0 ? "25%" : "33%";

    const attacksOrNavigationStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              height: tabsSize,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center" as const,
              ...getBackgroundColor("attacksOrNavigation"),
            } as const)
          : ({
              width: tabsSize,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("attacksOrNavigation"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    const equipmentStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              height: tabsSize as DimensionValue,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center",
              ...getBackgroundColor("equipment"),
            } as const)
          : ({
              width: tabsSize as DimensionValue,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("equipment"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    const logStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              height: tabsSize,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center",
              ...getBackgroundColor("log"),
            } as const)
          : ({
              width: tabsSize,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("log"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    const minonsStyle = useMemo(
      () =>
        uiStore.isLandscape
          ? ({
              height: tabsSize,
              paddingHorizontal: getNormalizedSize(10),
              justifyContent: "center",
              ...getBackgroundColor("minions"),
            } as const)
          : ({
              width: tabsSize,
              paddingVertical: getNormalizedSize(10),
              ...getBackgroundColor("minions"),
            } as const),
      [battleTab, getBackgroundColor],
    );

    return (
      <View style={styles.battleTabControls}>
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
          <Pressable
            style={minonsStyle}
            onPress={() => {
              vibration({ style: "light" });
              setBattleTab("minions");
            }}
          >
            <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
              Minions
            </Text>
          </Pressable>
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
