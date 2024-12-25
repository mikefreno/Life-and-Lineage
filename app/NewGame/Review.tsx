import { Text } from "../../components/Themed";
import { View } from "react-native";
import { useNavigation } from "expo-router";
import clearHistory, { toTitleCase, wait } from "../../utility/functions/misc";
import { createPlayerCharacter } from "../../utility/functions/characterAid";
import { Element, ElementToString } from "../../utility/types";
import { elementalColorMap, playerClassColors } from "../../constants/Colors";
import { useColorScheme } from "nativewind";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useNewGameStore } from "./_layout";
import { FadeSlide } from "../../components/AnimatedWrappers";

export default function NewGameReview() {
  const { firstName, lastName, blessingSelection, sex, classSelection } =
    useNewGameStore();

  const vibration = useVibration();

  let root = useRootStore();
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();

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
      <View className="flex-1 px-6">
        <Text
          className="pt-[8vh] text-center text-2xl"
          accessibilityRole="header"
        >
          Review
        </Text>
        <Text className="pt-[16vh] text-center text-3xl">
          {`${firstName} ${lastName} the `}
          <Text
            style={{
              color:
                blessingSelection == Element.assassination &&
                colorScheme == "dark"
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
            className="mt-4"
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
