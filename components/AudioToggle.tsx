import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { MaterialIcons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { Pressable } from "react-native";
import D20DieAnimation from "./DieRollAnim";

export const AudioToggle = observer(() => {
  const { audioStore, uiStore } = useRootStore();
  const vibration = useVibration();

  while (!audioStore) {
    return (
      <D20DieAnimation
        keepRolling
        showNumber={false}
        size={uiStore.iconSizeXL}
      />
    );
  }

  return (
    <Pressable
      onPress={() => {
        if (!audioStore.isInitializing) {
          vibration({ style: "light" });
          audioStore.setMuteValue(!audioStore.muted);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={`Toggle audio ${audioStore.muted ? "on" : "off"}`}
    >
      {audioStore.isInitializing ? (
        <D20DieAnimation
          keepRolling
          showNumber={false}
          size={uiStore.iconSizeXL}
        />
      ) : audioStore.muted ? (
        <MaterialIcons
          name="music-off"
          size={uiStore.iconSizeXL}
          color={uiStore.isDark ? "#fafafa" : "#27272a"}
        />
      ) : (
        <MaterialIcons
          name="music-note"
          size={uiStore.iconSizeXL}
          color={uiStore.isDark ? "#fafafa" : "#27272a"}
        />
      )}
    </Pressable>
  );
});
