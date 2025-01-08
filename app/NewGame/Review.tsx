import { Text } from "../../components/Themed";
import { View } from "react-native";
import { useNavigation } from "expo-router";
import clearHistory, { toTitleCase, wait } from "../../utility/functions/misc";
import { createPlayerCharacter } from "../../utility/functions/characterAid";
import { Element, ElementToString } from "../../utility/types";
import { elementalColorMap, playerClassColors } from "../../constants/Colors";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useNewGameStore } from "./_layout";
import { FadeSlide } from "../../components/AnimatedWrappers";
import { tw_base, useStyles } from "../../hooks/styles";

export default function NewGameReview() {
  const { firstName, lastName, blessingSelection, sex, classSelection } =
    useNewGameStore();

  const vibration = useVibration();

  let root = useRootStore();
  const navigation = useNavigation();
  const styles = useStyles();
  const { uiStore } = useRootStore();

  async function startGame() {
    if (classSelection && sex && blessingSelection !== undefined) {
      const player = createPlayerCharacter({
        sex,
        root,
        firstName,
        lastName,
        blessingSelection,
        classSelection,
      });

      await root.newGame(player);
      vibration({ style: "success" });
      wait(250).then(() => clearHistory(navigation));
    }
  }

  if (blessingSelection !== undefined && classSelection !== undefined) {
    return (
      <View style={styles.newGameContainer}>
        <Text style={styles.newGameHeader} accessibilityRole="header">
          Review
        </Text>
        <Text style={styles.newGameHeader}>
          {`${firstName} ${lastName} the `}
          <Text
            style={{
              color:
                blessingSelection == Element.assassination &&
                uiStore.colorScheme == "dark"
                  ? elementalColorMap[blessingSelection].light
                  : elementalColorMap[blessingSelection].dark,
            }}
          >{`${ElementToString[blessingSelection]}`}</Text>
          -born{" "}
          <Text
            style={{ color: playerClassColors[classSelection] }}
          >{`${toTitleCase(classSelection)}`}</Text>
        </Text>
        <FadeSlide>
          <GenericFlatButton
            onPress={startGame}
            style={{ marginTop: tw_base[4] }}
            accessibilityRole="button"
            accessibilityLabel="Confirm"
          >
            Confirm?
          </GenericFlatButton>
        </FadeSlide>
      </View>
    );
  }
}
