import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../../components/Themed";
import { useState } from "react";
import { router } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
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
import { useIsFocused } from "@react-navigation/native";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useNewGameStore } from "./_layout";
import { FadeSlide } from "../../components/AnimatedWrappers";
import { text, useStyles } from "../../hooks/styles";
import GenericFlatButton from "../../components/GenericFlatButton";

export default function SetBlessing() {
  const { classSelection, blessingSelection, setBlessingSelection } =
    useNewGameStore();

  const isFocused = useIsFocused();
  const vibration = useVibration();
  const { uiStore, tutorialStore, playerState, audioStore } = useRootStore();
  const { dimensions, colorScheme } = uiStore;
  const isDark = colorScheme === "dark";
  const styles = useStyles();

  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  if (!classSelection) {
    router.dismissAll();
    return;
  }
  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.blessing}
        isFocused={isFocused}
        override={forceShowTutorial}
        clearOverride={() => setForceShowTutorial(false)}
        pageOne={{
          title:
            "Magic is extremely powerful, but often very expensive to obtain.",
          body: "You will start with a book providing a spell pertaining to the blessing you choose, and a higher starting point in that school.",
        }}
        pageTwo={{
          body: "Each of the blessings are for your class. You can learn from these schools, but not from a school for a different class.",
        }}
      />

      <ScrollView>
        <View style={styles.newGameContainer}>
          <Text
            style={{
              ...styles.newGameHeader,
              maxWidth: dimensions.width * 0.75,
            }}
            accessibilityRole="header"
          >
            With What Blessing Was Your
            <Text style={{ color: playerClassColors[classSelection] }}>
              {` ${toTitleCase(classSelection)} `}
            </Text>
            Born?
          </Text>

          <ClassDependantBlessings
            playerClass={classSelection}
            vibration={vibration}
            blessing={blessingSelection}
            setBlessing={setBlessingSelection}
            colorScheme={colorScheme}
            dimensions={dimensions}
          />

          <Text
            style={{
              textAlign: "center",
              paddingHorizontal: 16,
              paddingTop: 16,
              ...text.lg,
            }}
          >
            {DescriptionMap[blessingSelection as Element]}
          </Text>

          <View
            style={{
              marginHorizontal: "auto",
              height: 128,
              paddingVertical: 8,
            }}
          >
            <FadeSlide show={blessingSelection == 0 || !!blessingSelection}>
              {({ showing }) => (
                <GenericFlatButton
                  onPress={() => router.push("/NewGame/SexSelect")}
                  accessibilityRole="link"
                  accessibilityLabel="Next"
                  disabled={!showing}
                >
                  <Text>Next</Text>
                </GenericFlatButton>
              )}
            </FadeSlide>
          </View>
        </View>

        {(tutorialStore.tutorialsEnabled || !playerState) && (
          <View style={{ position: "absolute", marginLeft: 16, marginTop: 16 }}>
            <Pressable
              style={{ position: "absolute" }}
              onPress={() => setForceShowTutorial(true)}
              accessibilityRole="button"
              accessibilityLabel="Show Tutorial"
            >
              <FontAwesome5
                name="question-circle"
                size={32}
                color={isDark ? "#fafafa" : "#27272a"}
              />
            </Pressable>
          </View>
        )}
        <View
          style={{ position: "absolute", zIndex: 10, marginTop: 16, right: 16 }}
        >
          <Pressable
            onPress={() => {
              audioStore.setMuteValue(!audioStore.muted);
            }}
            accessibilityRole="button"
            accessibilityLabel="Show Tutorial"
          >
            {audioStore.muted ? (
              <MaterialIcons
                name="music-off"
                size={32}
                color={isDark ? "#fafafa" : "#27272a"}
              />
            ) : (
              <MaterialIcons
                name="music-note"
                size={32}
                color={isDark ? "#fafafa" : "#27272a"}
              />
            )}
          </Pressable>
        </View>
      </ScrollView>
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
  const styles = useStyles();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={onPress}
      style={{
        height: dimensions.height * 0.25,
        width: dimensions.width * 0.45,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Select Blessing of ${ElementToString[element]}`}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.blessingPressable,
            pressed || blessing == element
              ? { borderRadius: 8, borderColor: isDark ? "#fafafa" : "#27272a" }
              : { borderColor: "transparent" },
          ]}
        >
          <BlessingDisplay
            blessing={element}
            colorScheme={colorScheme}
            size={dimensions.height * 0.15}
          />
          <Text
            style={{
              ...text.lg,
              textAlign: "center",
              paddingHorizontal: 8,
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
  const styles = useStyles();

  if (playerClass == "mage") {
    return (
      <View style={styles.columnEvenly}>
        <View style={styles.rowEvenly}>
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
        <View style={styles.rowEvenly}>
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
      <View style={styles.columnEvenly}>
        <View style={styles.rowEvenly}>
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
        <View style={styles.rowEvenly}>
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
      <View style={styles.columnEvenly}>
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
        <View style={styles.rowEvenly}>
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
      <View style={styles.columnEvenly}>
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
        <View style={styles.rowEvenly}>
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
  }
  return null;
}
