import { Pressable } from "react-native";
import { ThemedView, Text } from "../Themed";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";

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
  const vibration = useVibration();
  const { dungeonStore } = useRootStore();
  return (
    <ThemedView className="-mb-1 flex w-full flex-row justify-around">
      <Pressable
        className={`w-1/3 rounded-l py-4 ${
          battleTab == "attacksOrNavigation"
            ? "bg-zinc-150 dark:bg-zinc-800"
            : "active:bg-zinc-200 dark:active:bg-zinc-700"
        }`}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("attacksOrNavigation");
        }}
      >
        <Text className="text-center text-xl">
          {dungeonStore.inCombat ? "Attacks" : "Navigation"}
        </Text>
      </Pressable>
      <Pressable
        className={`w-1/3 py-4 ${
          battleTab == "equipment"
            ? " bg-zinc-150 dark:bg-zinc-800"
            : "active:bg-zinc-200 dark:active:bg-zinc-700"
        }`}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("equipment");
        }}
      >
        <Text className="text-center text-xl">Equipment</Text>
      </Pressable>
      <Pressable
        className={`w-1/3 rounded-r py-4 ${
          battleTab == "log"
            ? "bg-zinc-150 dark:bg-zinc-800"
            : "active:bg-zinc-200 dark:active:bg-zinc-700"
        }`}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("log");
        }}
      >
        <Text className="text-center text-xl">Log</Text>
      </Pressable>
    </ThemedView>
  );
}
