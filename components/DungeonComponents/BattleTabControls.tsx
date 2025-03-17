import { View, Pressable, DimensionValue } from "react-native";
import { Text } from "../Themed";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { normalize, useStyles } from "../../hooks/styles";
import { useMemo } from "react";

interface BattleTabControlsProps {
  battleTab: string;
  setBattleTab: (
    value: React.SetStateAction<"attacksOrNavigation" | "equipment" | "log">,
  ) => void;
}
export default function BattleTabControls({
  battleTab,
  setBattleTab,
}: BattleTabControlsProps) {
  const styles = useStyles();
  const vibration = useVibration();
  const { dungeonStore, uiStore } = useRootStore();

  const getBackgroundColor = (tab: string) => ({
    backgroundColor:
      battleTab === tab
        ? uiStore.colorScheme === "dark"
          ? "rgba(39, 39, 42, 0.3)"
          : "rgba(244, 244, 245, 0.3)"
        : undefined,
  });

  const attacksOrNavigationStyle = useMemo(
    () => ({
      width: "33.333%" as DimensionValue,
      paddingVertical: normalize(12),
      ...getBackgroundColor("attacksOrNavigation"),
    }),
    [battleTab, getBackgroundColor],
  );

  const equipmentStyle = useMemo(
    () => ({
      width: "33.333%" as DimensionValue,
      paddingVertical: normalize(12),
      ...getBackgroundColor("equipment"),
    }),
    [battleTab, getBackgroundColor],
  );

  const logStyle = useMemo(
    () => ({
      width: "33.333%" as DimensionValue,
      paddingVertical: normalize(12),
      ...getBackgroundColor("attacksOrNavigation"),
    }),
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
      <Pressable
        style={logStyle}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("log");
        }}
      >
        <Text style={{ textAlign: "center", ...styles["text-lg"] }}>Log</Text>
      </Pressable>
    </View>
  );
}
