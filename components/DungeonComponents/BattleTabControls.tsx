import { View, Pressable } from "react-native";
import { Text } from "../Themed";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { text, useStyles } from "../../hooks/styles";

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

  return (
    <View style={styles.battleTabControls}>
      <Pressable
        style={[
          {
            width: "33.333%",
            paddingVertical: 16,
          },
          getBackgroundColor("attacksOrNavigation"),
        ]}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("attacksOrNavigation");
        }}
      >
        <Text style={{ textAlign: "center", ...text.xl }}>
          {dungeonStore.inCombat ? "Attacks" : "Navigation"}
        </Text>
      </Pressable>
      <Pressable
        style={[
          {
            width: "33.333%",
            paddingVertical: 16,
          },
          getBackgroundColor("equipment"),
        ]}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("equipment");
        }}
      >
        <Text style={{ textAlign: "center", ...text.xl }}>Inventory</Text>
      </Pressable>
      <Pressable
        style={[
          {
            width: "33.333%",
            paddingVertical: 16,
          },
          getBackgroundColor("log"),
        ]}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("log");
        }}
      >
        <Text style={{ textAlign: "center", ...text.xl }}>Log</Text>
      </Pressable>
    </View>
  );
}
