import React from "react";
import { router } from "expo-router";
import { TutorialOption } from "../../utility/types";
import TutorialModal from "../../components/TutorialModal";
import { useRootStore } from "../../hooks/stores";
import { useVibration } from "../../hooks/generic";
import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../../components/Themed";
import { playerClassColors } from "../../constants/Colors";
import { toTitleCase } from "../../utility/functions/misc";
import { FontAwesome5, Foundation } from "@expo/vector-icons";
import { useNewGameStore } from "./_layout";
import GenericFlatLink from "../../components/GenericLink";
import { FadeSlide } from "../../components/AnimatedWrappers";
import { useStyles } from "../../hooks/styles";

export default function SetSex() {
  const styles = useStyles();
  const { classSelection, sex, setSex } = useNewGameStore();
  const vibration = useVibration();
  const [forceShowTutorial, setForceShowTutorial] = useState(false);
  const { playerState, tutorialStore, uiStore } = useRootStore();

  const isDark = uiStore.colorScheme === "dark";
  const isFocused = useIsFocused();

  if (!classSelection) {
    router.back();
    router.back();
    return;
  }

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.aging}
        override={forceShowTutorial}
        clearOverride={() => setForceShowTutorial(false)}
        isFocused={isFocused}
        pageOne={{
          title: "This game focuses around the passage of time.",
          body: "Almost everything will move the game clock forward, aging the characters in the game. At a certain point it will be nearly impossible to stay alive.",
        }}
        pageTwo={{
          body: "However, if you have a child, you can live on through the child, retaining much of what has been achieved in your previous life.",
        }}
      />
      <View style={styles.newGameContainer}>
        <Text style={[styles.text2xl, styles.newGameHeader]}>
          Set the sex of your{" "}
          <Text style={{ color: playerClassColors[classSelection] }}>
            {toTitleCase(classSelection)}
          </Text>
        </Text>
        <View style={styles.sexSelectionRow}>
          <Pressable
            onPress={() => {
              setSex("male");
              vibration({ style: "light" });
            }}
            accessibilityRole="button"
            accessibilityLabel="Select Male"
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.sexOption,
                  pressed || sex == "male"
                    ? {
                        borderRadius: 8,
                        borderColor: isDark ? "#fafafa" : "#27272a",
                      }
                    : { borderColor: "transparent" },
                ]}
              >
                <View style={{ marginHorizontal: "auto" }}>
                  <Foundation
                    name="male-symbol"
                    size={90}
                    color={playerClassColors[classSelection]}
                  />
                </View>
                <Text style={[styles.textLg, { textAlign: "center" }]}>
                  Male
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              setSex("female");
              vibration({ style: "light" });
            }}
            accessibilityRole="button"
            accessibilityLabel="Select Female"
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.sexOption,
                  pressed || sex == "female"
                    ? {
                        borderRadius: 8,
                        borderColor: isDark ? "#fafafa" : "#27272a",
                      }
                    : { borderColor: "transparent" },
                ]}
              >
                <View style={{ marginHorizontal: "auto" }}>
                  <Foundation
                    name="female-symbol"
                    size={90}
                    color={playerClassColors[classSelection]}
                  />
                </View>
                <Text style={[styles.textLg, { textAlign: "center" }]}>
                  Female
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={{ marginHorizontal: "auto", marginTop: 32 }}>
          <FadeSlide show={!!sex}>
            {({ showing }) => (
              <GenericFlatLink
                disabled={!showing}
                href="./NameSelect"
                accessibilityRole="link"
                accessibilityLabel="Next"
              >
                <Text>Next</Text>
              </GenericFlatLink>
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
    </>
  );
}
