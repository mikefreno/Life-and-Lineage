import { Pressable, View } from "react-native";
import { Text } from "../../components/Themed";
import { useState } from "react";
import { router } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import TutorialModal from "../../components/TutorialModal";
import { DescriptionMap } from "../../utility/descriptions";
import {
  Element,
  ElementToString,
  PlayerClassOptions,
  TutorialOption,
} from "../../utility/types";

import BlessingDisplay from "../../components/BlessingsDisplay";
import { toTitleCase } from "../../utility/functions/misc";
import { elementalColorMap, playerClassColors } from "../../constants/Colors";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useIsFocused } from "@react-navigation/native";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useNewGameStore } from "./_layout";

export default function SetBlessing() {
  const { classSelection, blessingSelection, setBlessingSelection } =
    useNewGameStore();

  if (!classSelection) {
    router.dismissAll();
    return;
  }

  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();
  const { uiStore, tutorialStore, playerState } = useRootStore();
  const { dimensions } = uiStore;

  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.blessing}
        isFocused={isFocused}
        override={forceShowTutorial}
        clearOverride={() => setForceShowTutorial(false)}
        pageOne={{
          title:
            "Magic is a extremely powerful, but often very expensive obtain.",
          body: "You will start with a book providing a spell pertaining to blessing you choose, and a higher starting point in that school.",
        }}
        pageTwo={{
          body: "Each of the blessings are for your class, you can learn from of these schools, but not from a school for a different class.",
        }}
      />
      <View className="flex-1 pt-[8vh]">
        <Text className="text-center text-2xl px-4">
          With What Blessing Was Your
          <Text
            style={{ color: playerClassColors[classSelection] }}
          >{` ${toTitleCase(classSelection)} `}</Text>
          Born?
        </Text>
        <>
          <ClassDependantBlessings
            playerClass={classSelection}
            vibration={vibration}
            blessing={blessingSelection}
            setBlessing={setBlessingSelection}
            colorScheme={colorScheme}
            dimensions={dimensions.window}
          />
          <Text className="text-center md:text-lg px-4">
            {DescriptionMap[blessingSelection as Element]}
          </Text>
          {blessingSelection == 0 || blessingSelection ? ( // sometimes I really hate ts. Evaluation of 0 is false.
            <View className="mx-auto h-32 py-2">
              <GenericFlatButton
                onPress={() => {
                  vibration({ style: "light" });
                  router.push(`/SexSelect`);
                }}
              >
                Next
              </GenericFlatButton>
            </View>
          ) : (
            <View className="h-32"></View>
          )}
        </>
      </View>
      {tutorialStore.tutorialsEnabled ||
        (!playerState && (
          <View className="absolute ml-4 mt-4">
            <Pressable
              className="absolute z-top"
              onPress={() => {
                setForceShowTutorial(true);
              }}
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

const BlessingPressable = ({
  element,
  onPress,
  colorScheme,
  dimensions,
  blessing,
}: {
  element: Element;
  onPress: () => void;
  colorScheme: "dark" | "light";
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
  blessing: Element | undefined;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: dimensions.height * 0.25,
        width: dimensions.width * 0.45,
      }}
    >
      {({ pressed }) => (
        <View
          className={`${
            pressed || blessing == element
              ? "rounded-lg border-zinc-900 dark:border-zinc-50"
              : "border-transparent"
          } w-full h-full border flex items-center justify-center`}
        >
          <BlessingDisplay
            blessing={element}
            colorScheme={colorScheme}
            size={dimensions.height * 0.15}
          />
          <Text
            className="text-center text-lg px-2"
            style={{
              color:
                element == Element.assassination && colorScheme == "dark"
                  ? elementalColorMap[element].light
                  : elementalColorMap[element].dark,
            }}
          >
            Blessing of {ElementToString[element]}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

function ClassDependantBlessings({
  playerClass,
  vibration,
  setBlessing,
  colorScheme,
  dimensions,
  blessing,
}: {
  playerClass: PlayerClassOptions;
  vibration: ({
    style,
    essential,
  }: {
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
    essential?: boolean | undefined;
  }) => void;
  blessing: Element | undefined;
  setBlessing: React.Dispatch<React.SetStateAction<Element | undefined>>;
  colorScheme: "dark" | "light";
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
}) {
  if (playerClass == "mage") {
    return (
      <View className="flex items-center justify-evenly py-6">
        <View className="mb-8 flex flex-row justify-evenly">
          <BlessingPressable
            element={Element.fire}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.fire);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
          <BlessingPressable
            element={Element.water}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.water);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
        </View>
        <View className="flex flex-row justify-evenly">
          <BlessingPressable
            element={Element.air}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.air);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
          <BlessingPressable
            element={Element.earth}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.earth);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
        </View>
      </View>
    );
  } else if (playerClass == "necromancer") {
    return (
      <View className="flex items-center justify-evenly py-6">
        <View className="mb-8 flex flex-row justify-evenly">
          <BlessingPressable
            element={Element.summoning}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.summoning);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
          <BlessingPressable
            element={Element.pestilence}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.pestilence);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
        </View>
        <View className="flex flex-row justify-evenly">
          <BlessingPressable
            element={Element.bone}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.bone);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
          <BlessingPressable
            element={Element.blood}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.blood);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
        </View>
      </View>
    );
  } else if (playerClass == "paladin") {
    return (
      <View className="flex items-center justify-evenly py-6">
        <BlessingPressable
          element={Element.holy}
          onPress={() => {
            vibration({ style: "light" });
            setBlessing(Element.holy);
          }}
          colorScheme={colorScheme}
          dimensions={dimensions}
          blessing={blessing}
        />
        <View className="mt-8 flex flex-row justify-evenly">
          <BlessingPressable
            element={Element.vengeance}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.vengeance);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
          <BlessingPressable
            element={Element.protection}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.protection);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
        </View>
      </View>
    );
  } else if (playerClass == "ranger") {
    return (
      <View className="flex items-center justify-evenly py-6">
        <BlessingPressable
          element={Element.beastMastery}
          onPress={() => {
            vibration({ style: "light" });
            setBlessing(Element.beastMastery);
          }}
          colorScheme={colorScheme}
          dimensions={dimensions}
          blessing={blessing}
        />
        <View className="mt-8 flex flex-row justify-evenly">
          <BlessingPressable
            element={Element.arcane}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.arcane);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
          <BlessingPressable
            element={Element.assassination}
            onPress={() => {
              vibration({ style: "light" });
              setBlessing(Element.assassination);
            }}
            colorScheme={colorScheme}
            dimensions={dimensions}
            blessing={blessing}
          />
        </View>
      </View>
    );
  } else throw new Error(`invalid class set: ${playerClass}`);
}
