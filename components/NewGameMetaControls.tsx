import { useRootStore } from "@/hooks/stores";
import { flex, tw, useStyles } from "@/hooks/styles";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { Pressable, View } from "react-native";

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
                size={uiStore.dimensions.greater / 24}
                color={uiStore.isDark ? "#fafafa" : "#27272a"}
              />
            </Pressable>
          )}
        <Pressable
          onPress={() => {
            audioStore.setMuteValue(!audioStore.muted);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Toggle audio ${audioStore.muted ? "on" : "off"}`}
        >
          {audioStore.muted ? (
            <MaterialIcons
              name="music-off"
              size={uiStore.dimensions.greater / 24}
              color={uiStore.isDark ? "#fafafa" : "#27272a"}
            />
          ) : (
            <MaterialIcons
              name="music-note"
              size={uiStore.dimensions.greater / 24}
              color={uiStore.isDark ? "#fafafa" : "#27272a"}
            />
          )}
        </Pressable>
      </View>
    );
  },
);

export default NewGameMetaControls;
