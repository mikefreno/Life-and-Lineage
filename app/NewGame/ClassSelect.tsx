import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text, ThemedView } from "@/components/Themed";
import { useLayoutEffect, useState } from "react";
import TutorialModal from "@/components/TutorialModal";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "@/assets/icons/SVGIcons";
import { PlayerClassOptions, TutorialOption } from "@/utility/types";
import { ClassDescriptionMap } from "@/utility/descriptions";
import GenericModal from "@/components/GenericModal";
import { wait } from "@/utility/functions/misc";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useNewGameStore } from "@/app/NewGame/_layout";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useRouter } from "expo-router";
import { tw_base, useStyles } from "@/hooks/styles";
import NewGameMetaControls from "@/components/NewGameMetaControls";
import { NecromancerPaywall, RangerPaywall } from "@/components/IAPPaywalls";

const SetClassScreen = observer(() => {
  const vibration = useVibration();
  const { classSelection, setClassSelection, setBlessingSelection } =
    useNewGameStore();
  const router = useRouter();
  const { uiStore, playerState, tutorialStore, iapStore } = useRootStore();
  const { height, width } = uiStore.dimensions;

  const styles = useStyles();

  const isFocused = useIsFocused();

  const [forceShowTutorial, setForceShowTutorial] = useState<boolean>(false);

  const [showTutorialReset, setShowTutorialReset] = useState<boolean>(false);

  const [showNecroPaywall, setShowNecroPaywall] = useState<boolean>(false);
  const [showRangerPaywall, setShowRangerPaywall] = useState<boolean>(false);

  useLayoutEffect(() => {
    wait(200).then(() => {
      setShowTutorialReset(!!playerState);
    });
  }, []);

  const handleRangerSelection = () => {
    //TODO, use has purchased
    if (iapStore.rangerUnlocked) {
      vibration({ style: "light" });
      if (classSelection !== PlayerClassOptions.ranger) {
        setClassSelection(PlayerClassOptions.ranger);
        setBlessingSelection(undefined);
      }
    } else {
      setShowRangerPaywall(true);
    }
  };

  const handleNecromancerSelection = () => {
    //TODO, use has purchased
    if (iapStore.necromancerUnlocked) {
      vibration({ style: "light" });
      if (classSelection !== PlayerClassOptions.necromancer) {
        setClassSelection(PlayerClassOptions.necromancer);
        setBlessingSelection(undefined);
      }
    } else {
      setShowNecroPaywall(true);
    }
  };

  return (
    <>
      <NecromancerPaywall
        isVisibleCondition={showNecroPaywall}
        onClose={() => {
          setShowNecroPaywall(false);
          if (iapStore.necromancerUnlocked) {
            setClassSelection(PlayerClassOptions.necromancer);
            setBlessingSelection(undefined);
          }
        }}
      />
      <RangerPaywall
        isVisibleCondition={showRangerPaywall}
        onClose={() => {
          setShowRangerPaywall(false);
          if (iapStore.rangerUnlocked) {
            setClassSelection(PlayerClassOptions.ranger);
            setBlessingSelection(undefined);
          }
        }}
      />
      <TutorialModal
        tutorial={TutorialOption.class}
        override={forceShowTutorial}
        isFocused={isFocused}
        clearOverride={() => setForceShowTutorial(false)}
        pageOne={{
          title: "Welcome To Life and Lineage!",
          body: "Let's start with selecting your class...",
        }}
      />
      <GenericModal
        isVisibleCondition={showTutorialReset}
        backFunction={() => setShowTutorialReset(false)}
        accessibilityRole="alert"
      >
        <Text style={{ textAlign: "center", ...styles["text-2xl"] }}>
          Tutorial Reset
        </Text>
        <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
          Would you like to reset tutorials?
        </Text>
        <ThemedView
          style={[
            styles.rowBetween,
            { paddingHorizontal: uiStore.dimensions.width * 0.05 },
          ]}
        >
          <GenericFlatButton
            onPress={() => {
              setShowTutorialReset(false);
              if (!!playerState) {
                wait(750).then(() => {
                  tutorialStore.resetTutorialState(() =>
                    setForceShowTutorial(true),
                  );
                });
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset Tutorial"
          >
            Reset
          </GenericFlatButton>
          <GenericFlatButton
            onPress={() => setShowTutorialReset(false)}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            Cancel
          </GenericFlatButton>
        </ThemedView>
      </GenericModal>
      <ScrollView>
        <View style={styles.newGameContainer}>
          <Text style={styles.newGameHeader}>Class Selection</Text>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-evenly",
            }}
          >
            <Pressable
              style={{
                height: height * 0.25,
                width: width * 0.45,
              }}
              onPress={() => {
                vibration({ style: "light" });
                if (classSelection !== PlayerClassOptions.mage) {
                  setClassSelection(PlayerClassOptions.mage);
                  setBlessingSelection(undefined);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Select Mage"
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.border,
                    {
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    pressed || classSelection == PlayerClassOptions.mage
                      ? [
                          {
                            borderRadius: 8,
                            borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
                          },
                        ]
                      : { borderColor: "transparent" },
                  ]}
                >
                  <WizardHat
                    style={{ marginBottom: 5 }}
                    color={uiStore.isDark ? "#2563eb" : "#1e40af"}
                    height={height * 0.15}
                    width={height * 0.15}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#2563eb",
                      ...styles["text-xl"],
                    }}
                  >
                    Mage
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={{
                height: height * 0.25,
                width: width * 0.45,
              }}
              onPress={handleRangerSelection}
              accessibilityRole="button"
              accessibilityLabel="Select Ranger"
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.border,
                    {
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    pressed || classSelection == PlayerClassOptions.ranger
                      ? [
                          {
                            borderRadius: 8,
                            borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
                          },
                        ]
                      : { borderColor: "transparent" },
                  ]}
                >
                  <View style={{ transform: [{ rotate: "12deg" }] }}>
                    <RangerIcon
                      style={{ marginBottom: 5 }}
                      height={height * 0.15}
                      width={height * 0.15}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "green",
                      ...styles["text-xl"],
                    }}
                  >
                    Ranger
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-evenly",
            }}
          >
            <Pressable
              style={{
                height: height * 0.25,
                width: width * 0.45,
              }}
              onPress={handleNecromancerSelection}
              accessibilityRole="button"
              accessibilityLabel="Select Necromancer"
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.border,
                    {
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    pressed || classSelection == PlayerClassOptions.necromancer
                      ? [
                          {
                            borderRadius: 8,
                            borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
                          },
                        ]
                      : { borderColor: "transparent" },
                  ]}
                >
                  <View style={{ transform: [{ rotate: "-12deg" }] }}>
                    <NecromancerSkull
                      style={{ marginBottom: 5 }}
                      color={uiStore.isDark ? "#9333ea" : "#6b21a8"}
                      height={height * 0.15}
                      width={height * 0.15}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#9333ea",
                      ...styles["text-xl"],
                    }}
                  >
                    Necromancer
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={{
                height: height * 0.25,
                width: width * 0.45,
              }}
              onPress={() => {
                vibration({ style: "light" });
                if (classSelection !== PlayerClassOptions.paladin) {
                  setClassSelection(PlayerClassOptions.paladin);
                  setBlessingSelection(undefined);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Select Paladin"
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.border,
                    {
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    pressed || classSelection == PlayerClassOptions.paladin
                      ? [
                          {
                            borderRadius: 8,
                            borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
                          },
                        ]
                      : { borderColor: "transparent" },
                  ]}
                >
                  <View style={{ transform: [{ rotate: "12deg" }] }}>
                    <View style={{ transform: [{ scaleX: -1 }] }}>
                      <PaladinHammer
                        height={height * 0.15}
                        width={height * 0.15}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#fcd34d",
                      ...styles["text-xl"],
                    }}
                  >
                    Paladin
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <Text style={styles.classDescriptionText}>
            {classSelection && ClassDescriptionMap[classSelection]}
          </Text>

          <GenericFlatButton
            disabled={classSelection === undefined}
            onPress={() => {
              vibration({ style: "light" });
              router.push("/NewGame/BlessingSelect");
            }}
            accessibilityRole="link"
            accessibilityLabel="Next"
            childrenWhenDisabled={"Select class to continue"}
            style={{
              marginTop: tw_base[3],
              paddingBottom: uiStore.insets?.bottom,
            }}
          >
            Next
          </GenericFlatButton>
        </View>
        <NewGameMetaControls
          forceShowTutorial={() => setForceShowTutorial(true)}
        />
      </ScrollView>
    </>
  );
});
export default SetClassScreen;
