import { router, useLocalSearchParams } from "expo-router";
import { View as ThemedView, Text } from "../../../components/Themed";
import { FontAwesome5, Foundation } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useContext, useRef, useState } from "react";
import { useVibration } from "../../../utility/customHooks";
import { AppContext } from "../../_layout";
import { useColorScheme } from "nativewind";
import TutorialModal from "../../../components/TutorialModal";
import {
  PlayerClassOptions,
  TutorialOption,
  isPlayerClassOptions,
} from "../../../utility/types";
import { toTitleCase } from "../../../utility/functions/misc";
import { playerClassColors } from "../../../constants/Colors";
import GenericFlatButton from "../../../components/GenericFlatButton";
import { useIsFocused } from "@react-navigation/native";

export default function SetSex() {
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  let playerClass: PlayerClassOptions;

  if (isPlayerClassOptions(slug[0])) {
    playerClass = slug[0];
  } else {
    return <Text>{`Invalid player class option: ${slug[0]}`}</Text>;
  }
  const blessing = slug[1];
  const [sex, setSex] = useState<"male" | "female">();
  const { colorScheme } = useColorScheme();

  let sexRef = useRef<"male" | "female">();
  const vibration = useVibration();
  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { gameState } = appData;
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
      <ThemedView className="flex-1 items-center">
        <Text className="mt-[6vh] text-center text-2xl md:text-3xl">
          Set the sex of your{" "}
          <Text style={{ color: playerClassColors[playerClass] }}>
            {toTitleCase(playerClass)}
          </Text>
        </Text>
        <ThemedView className="mt-[12vh] flex w-full flex-row justify-evenly">
          <Pressable
            className="w-1/3"
            onPress={() => {
              setSex("male");
              sexRef.current = "male";
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
                    color={playerClassColors[playerClass]}
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
              sexRef.current = "female";
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
                    color={playerClassColors[playerClass]}
                  />
                </View>
                <Text className="text-center text-lg">Female</Text>
              </View>
            )}
          </Pressable>
        </ThemedView>
        {sex ? (
          <View className="mx-auto mt-8">
            <GenericFlatButton
              onPressFunction={() => {
                vibration({ style: "light" });
                router.push(
                  `/NewGame/SetName/${playerClass}/${blessing}/${sexRef.current}`,
                );
              }}
            >
              Next
            </GenericFlatButton>
          </View>
        ) : null}
      </ThemedView>
      {(gameState && gameState.tutorialsEnabled) ||
        (!gameState && (
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
        ))}
    </>
  );
}
