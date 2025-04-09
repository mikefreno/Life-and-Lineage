import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { MaterialIcons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { Pressable } from "react-native";

export const AudioToggle = observer(() => {
  const { audioStore, uiStore } = useRootStore();
  const vibration = useVibration();

  return (
    <Pressable
      onPress={() => {
        vibration({ style: "light" });
        audioStore.setMuteValue(!audioStore.muted);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Toggle audio ${audioStore.muted ? "on" : "off"}`}
    >
      {audioStore.muted ? (
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
