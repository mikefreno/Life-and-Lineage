import React from "react";
import { useRouter } from "expo-router";
import { TutorialOption } from "@/utility/types";
import TutorialModal from "@/components/TutorialModal";
import { useRootStore } from "@/hooks/stores";
import { useVibration } from "@/hooks/generic";
import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/Themed";
import { playerClassColors } from "@/constants/Colors";
import { toTitleCase } from "@/utility/functions/misc";
import { Foundation } from "@expo/vector-icons";
import { useNewGameStore } from "@/app/NewGame/_layout";
import { tw, tw_base, useStyles } from "@/hooks/styles";
import GenericFlatButton from "@/components/GenericFlatButton";
import NewGameMetaControls from "@/components/NewGameMetaControls";

export default function SetSex() {
  const styles = useStyles();
  const { classSelection, sex, setSex } = useNewGameStore();
  const vibration = useVibration();
  const [forceShowTutorial, setForceShowTutorial] = useState(false);
  const { uiStore } = useRootStore();
  const isFocused = useIsFocused();
  const router = useRouter();

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
          body: "Almost everything will move the game clock forward, aging the characters in the game(including you!). At a certain point it will be nearly impossible to stay alive.",
        }}
        pageTwo={{
          body: "However, if you have a child, you can live on through the child, retaining much of what has been achieved in your previous life.",
        }}
      />
      <ScrollView>
        <View style={styles.newGameContainer}>
          <Text style={[tw.px2, styles.newGameHeader]}>
            Set the sex of your{" "}
            <Text
              style={[
                styles.newGameHeader,
                { color: playerClassColors[classSelection] },
              ]}
            >
              {toTitleCase(classSelection)}
            </Text>
          </Text>
          <View style={styles.sexSelectionRow}>
            <Pressable
              onPress={() => {
                setSex("male");
                vibration({ style: "light" });
              }}
              style={{ width: "50%" }}
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
                          borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
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
                  <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
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
              style={{
                width: "50%",
                marginHorizontal: "auto",
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
                          borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
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
                  <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
                    Female
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          <GenericFlatButton
            onPress={() => {
              vibration({ style: "light" });
              router.push("/NewGame/NameSelect");
            }}
            accessibilityRole="link"
            accessibilityLabel="Next"
            disabled={!sex}
            childrenWhenDisabled={"Select sex to continue"}
            style={{ marginTop: tw_base[3] }}
          >
            Next
          </GenericFlatButton>
        </View>
      </ScrollView>
      <NewGameMetaControls
        forceShowTutorial={() => setForceShowTutorial(true)}
      />
    </>
  );
}
