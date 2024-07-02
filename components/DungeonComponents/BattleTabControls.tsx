import { Pressable } from "react-native";
import { View, Text } from "../Themed";
import { useVibration } from "../../utility/customHooks";

interface BattleTabControlsProps {
  battleTab: string;
  setBattleTab: (
    value: React.SetStateAction<"attacksOrNavigation" | "equipment" | "log">,
  ) => void;
  inCombat: boolean;
}
export default function BattleTabControls({
  battleTab,
  setBattleTab,
  inCombat,
}: BattleTabControlsProps) {
  const vibration = useVibration();
  return (
    <View className="-mb-1 flex w-full flex-row justify-around">
      <Pressable
        className={`mx-2 w-32 rounded py-4 ${
          battleTab == "attacksOrNavigation"
            ? "bg-zinc-100 dark:bg-zinc-800"
            : "active:bg-zinc-200 dark:active:bg-zinc-700"
        }`}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("attacksOrNavigation");
        }}
      >
        <Text className="text-center text-xl">
          {inCombat ? "Attacks" : "Navigation"}
        </Text>
      </Pressable>
      <Pressable
        className={`mx-2 w-32 rounded py-4 ${
          battleTab == "equipment"
            ? "border-zinc-200 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
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
        className={`align mx-2 w-32 rounded py-4 ${
          battleTab == "log"
            ? "bg-zinc-100 dark:bg-zinc-800"
            : "active:bg-zinc-200 dark:active:bg-zinc-700"
        }`}
        onPress={() => {
          vibration({ style: "light" });
          setBattleTab("log");
        }}
      >
        <Text className="text-center text-xl">Log</Text>
      </Pressable>
    </View>
  );
}
