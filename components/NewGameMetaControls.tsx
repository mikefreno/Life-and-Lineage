import { useRootStore } from "@/hooks/stores";
import { flex, tw, useStyles } from "@/hooks/styles";
import { FontAwesome5 } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { Pressable, View } from "react-native";
import { AudioToggle } from "./AudioToggle";

const NewGameMetaControls = observer(
  ({ forceShowTutorial }: { forceShowTutorial?: () => void }) => {
    const { playerState, tutorialStore, uiStore } = useRootStore();
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
        <AudioToggle />
      </View>
    );
  },
);

export default NewGameMetaControls;
