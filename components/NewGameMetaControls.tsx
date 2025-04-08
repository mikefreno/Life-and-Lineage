import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { flex, tw, useStyles } from "@/hooks/styles";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { Pressable, View } from "react-native";
import D20DieAnimation from "./DieRollAnim";

const NewGameMetaControls = observer(
  ({ forceShowTutorial }: { forceShowTutorial?: () => void }) => {
    const { playerState, tutorialStore, audioStore, uiStore } = useRootStore();
    const styles = useStyles();

    return (
      <View
        style={[
          flex.columnCenter,
          tw.ml2,
          tw.mt2,
          styles.notchAvoidingLanscapePad,
          {
            position: "absolute",
          },
        ]}
      >
        {forceShowTutorial &&
          (tutorialStore.tutorialsEnabled || !playerState) && (
            <Pressable
              style={{ marginBottom: 4 }}
              onPress={forceShowTutorial}
              accessibilityRole="button"
              accessibilityLabel="Show Tutorial"
            >
              <FontAwesome5
                name="question-circle"
                size={uiStore.iconSizeXL}
                color={uiStore.isDark ? "#fafafa" : "#27272a"}
              />
            </Pressable>
          )}
        <AudioToggleButton />
      </View>
    );
  },
);

export default NewGameMetaControls;

const AudioToggleButton = observer(() => {
  const { audioStore, uiStore } = useRootStore();
  const vibration = useVibration();

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
