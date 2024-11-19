import { router } from "expo-router";
import { TutorialOption } from "../../utility/types";
import TutorialModal from "../../components/TutorialModal";
import { useRootStore } from "../../hooks/stores";
import { useVibration } from "../../hooks/generic";
import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";
import { Text } from "../../components/Themed";
import { playerClassColors } from "../../constants/Colors";
import { toTitleCase } from "../../utility/functions/misc";
import { FontAwesome5, Foundation } from "@expo/vector-icons";
import { useNewGameStore } from "./_layout";
import GenericFlatLink from "../../components/GenericLink";

export default function SetSex() {
  const [sex, setSex] = useState<"male" | "female">();
  const { colorScheme } = useColorScheme();
  const { classSelection } = useNewGameStore();
  if (!classSelection) {
    router.back();
    router.back();
    return;
  }

  const vibration = useVibration();
  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  const { playerState, tutorialStore } = useRootStore();
  const isFocused = useIsFocused();

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.aging}
        override={forceShowTutorial}
        clearOverride={() => setForceShowTutorial(false)}
        isFocused={isFocused}
        pageOne={{
          title: "This game focuses around the passage of time.",
          body: "Almost everything will move the game clock forward, aging the characters in the game. At a certain point it will nearly impossible to stay alive.",
        }}
        pageTwo={{
          body: "However, if you have a child, you can live on through the child retaining much of what has been achieved in your previous life",
        }}
      />
      <View className="flex-1 items-center">
        <Text className="mt-[6vh] text-center text-2xl md:text-3xl">
          Set the sex of your{" "}
          <Text style={{ color: playerClassColors[classSelection] }}>
            {toTitleCase(classSelection)}
          </Text>
        </Text>
        <View className="mt-[12vh] flex w-full flex-row justify-evenly">
          <Pressable
            className="w-1/3"
            onPress={() => {
              setSex("male");
              vibration({ style: "light" });
            }}
          >
            {({ pressed }) => (
              <View
                className={`${
                  pressed || sex == "male"
                    ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                    : "border-transparent"
                } py-4 border`}
              >
                <View className="mx-auto">
                  <Foundation
                    name="male-symbol"
                    size={90}
                    color={playerClassColors[classSelection]}
                  />
                </View>
                <Text className="text-center text-lg">Male</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            className="w-1/3"
            onPress={() => {
              setSex("female");
              vibration({ style: "light" });
            }}
          >
            {({ pressed }) => (
              <View
                className={`${
                  pressed || sex == "female"
                    ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                    : "border-transparent"
                } py-4 border`}
              >
                <View className="mx-auto">
                  <Foundation
                    name="female-symbol"
                    size={90}
                    color={playerClassColors[classSelection]}
                  />
                </View>
                <Text className="text-center text-lg">Female</Text>
              </View>
            )}
          </Pressable>
        </View>
        {sex ? (
          <View className="mx-auto mt-8">
            <GenericFlatLink href="./NameSelect">
              <Text>Next</Text>
            </GenericFlatLink>
          </View>
        ) : null}
      </View>
      {(tutorialStore.tutorialsEnabled || !playerState) && (
        <View className="absolute ml-4 mt-4">
          <Pressable
            className="absolute"
            onPress={() => setForceShowTutorial(true)}
          >
            <FontAwesome5
              name="question-circle"
              size={32}
              color={colorScheme == "light" ? "#27272a" : "#fafafa"}
            />
          </Pressable>
        </View>
      )}
    </>
  );
}
