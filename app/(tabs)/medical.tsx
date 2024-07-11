import { ScrollView, View as ThemedView, Text } from "../../components/Themed";
import healthOptions from "../../assets/json/medicalOptions/healthOptions.json";
import manaOptions from "../../assets/json/medicalOptions/manaOptions.json";
import sanityOptions from "../../assets/json/medicalOptions/sanityOptions.json";
import otherOptions from "../../assets/json/medicalOptions/otherOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../_layout";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { Pressable, StyleSheet, View, Platform } from "react-native";
import { useVibration } from "../../utility/customHooks";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
import GenericStrikeAround from "../../components/GenericStrikeAround";

export default function MedicalScreen() {
  const gameContext = useContext(GameContext);
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  if (!gameContext) {
    throw new Error("Missing Context");
  }
  const { gameState } = gameContext;
  const [showMedicalTutorial, setShowMedicalTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("medical")) ?? false,
  );
  const [showingHealthOptions, setShowingHealthOptions] = useState<boolean>(
    gameState?.medicalOptions.health ?? true,
  );
  const showingHealthRef = useRef<boolean>(
    gameState?.medicalOptions.health ?? true,
  );
  const [showingManaOptions, setShowingManaOptions] = useState<boolean>(
    gameState?.medicalOptions.mana ?? true,
  );
  const showingManaRef = useRef<boolean>(
    gameState?.medicalOptions.mana ?? true,
  );
  const [showingSanityOptions, setShowingSanityOptions] = useState<boolean>(
    gameState?.medicalOptions.sanity ?? true,
  );
  const showingSanityRef = useRef<boolean>(
    gameState?.medicalOptions.sanity ?? true,
  );
  const [showingOtherOptions, setShowingOtherOptions] = useState<boolean>(
    gameState?.medicalOptions.other ?? true,
  );
  const showingOtherRef = useRef<boolean>(
    gameState?.medicalOptions.other ?? true,
  );

  const vibration = useVibration();

  useEffect(() => {
    if (!showMedicalTutorial && gameState) {
      gameState.updateTutorialState("medical", true);
    }
  }, [showMedicalTutorial]);

  useEffect(() => {
    if (gameState) {
      gameState.setMedicalOptionVisibility("health", showingHealthOptions);
      gameState.setMedicalOptionVisibility("mana", showingManaOptions);
      gameState.setMedicalOptionVisibility("sanity", showingSanityOptions);
      gameState.setMedicalOptionVisibility("other", showingOtherOptions);
    }
  }, [
    gameState,
    showingHealthOptions,
    showingManaOptions,
    showingSanityOptions,
    showingOtherOptions,
  ]);

  return (
    <>
      <TutorialModal
        isVisibleCondition={
          (showMedicalTutorial && gameState?.tutorialsEnabled && isFocused) ??
          false
        }
        backFunction={() => setShowMedicalTutorial(false)}
        onCloseFunction={() => setShowMedicalTutorial(false)}
        pageOne={{
          title: "Medical Tab",
          body: "Here you can acquire various forms of medical treatment.",
        }}
        pageTwo={{
          title: "Note: These tick the game clock forward",
          body: "Using items such as potions, or using spells will not tick the clock forward.",
        }}
      />
      <View
        className="absolute z-10 h-12 w-full shadow-diffuse"
        style={{ top: useHeaderHeight() }}
      >
        <ThemedView className="flex flex-row justify-evenly mx-4 pb-1 pt-4 -mt-2 rounded-xl">
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowingHealthOptions(!showingHealthRef.current);
              showingHealthRef.current = !showingHealthRef.current;
            }}
            className={`${
              showingHealthOptions ? "bg-[#ef4444]" : "bg-zinc-100"
            } rounded-lg px-4 py-2 active:scale-95 active:opacity-50`}
          >
            <Text style={{ color: showingHealthOptions ? "white" : "#a1a1aa" }}>
              Health
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowingManaOptions(!showingManaRef.current);
              showingManaRef.current = !showingManaRef.current;
            }}
            className={`${
              showingManaOptions ? "bg-[#60a5fa]" : "bg-zinc-100"
            } rounded-lg px-4 py-2 active:scale-95 active:opacity-50`}
          >
            <Text style={{ color: showingManaOptions ? "white" : "#a1a1aa" }}>
              Mana
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowingSanityOptions(!showingSanityRef.current);
              showingSanityRef.current = !showingSanityRef.current;
            }}
            className={`${
              showingSanityOptions ? "bg-[#c084fc]" : "bg-zinc-100"
            } rounded-lg px-4 py-2 active:scale-95 active:opacity-50`}
          >
            <Text style={{ color: showingSanityOptions ? "white" : "#a1a1aa" }}>
              Sanity
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowingOtherOptions(!showingOtherRef.current);
              showingOtherRef.current = !showingOtherRef.current;
            }}
            className={`${
              showingOtherOptions ? "bg-[#e4e4e7]" : "bg-zinc-100"
            } rounded-lg px-4 py-2 active:scale-95 active:opacity-50`}
          >
            <Text style={{ color: showingOtherOptions ? "black" : "#a1a1aa" }}>
              Other
            </Text>
          </Pressable>
        </ThemedView>
      </View>
      <ThemedView className="flex-1">
        <ScrollView>
          <ThemedView
            className="px-2"
            style={{
              paddingBottom: useBottomTabBarHeight() + 80,
              paddingTop: useHeaderHeight() + 48,
            }}
          >
            <View className="flex flex-row">
              <View className="w-1/2">
                {showingHealthOptions && (
                  <>
                    <GenericStrikeAround text={"Health"} />
                    {healthOptions.map((medOption, index) => (
                      <MedicalOption
                        key={index}
                        title={medOption.serviceName}
                        cost={medOption.cost}
                        healthRestore={
                          medOption.heathRestore as number | "fill"
                        }
                      />
                    ))}
                  </>
                )}
                {showingOtherOptions && (
                  <>
                    <GenericStrikeAround text={"Other"} />
                    {otherOptions.map((medOption, index) => (
                      <MedicalOption
                        key={index}
                        title={medOption.serviceName}
                        cost={medOption.cost}
                        removeDebuffs={
                          medOption.removeDebuffs as number | "all"
                        }
                      />
                    ))}
                  </>
                )}
              </View>
              <View className="w-1/2">
                {showingManaOptions && (
                  <>
                    <GenericStrikeAround text={"Mana"} />
                    {manaOptions.map((medOption, index) => (
                      <MedicalOption
                        key={index}
                        title={medOption.serviceName}
                        cost={medOption.cost}
                        manaRestore={medOption.manaRestore as number | "fill"}
                      />
                    ))}
                  </>
                )}

                {showingSanityOptions && (
                  <>
                    <GenericStrikeAround text={"Sanity"} />
                    {sanityOptions.map((medOption, index) => (
                      <MedicalOption
                        key={index}
                        title={medOption.serviceName}
                        cost={medOption.cost}
                        sanityRestore={
                          medOption.sanityRestore as number | "fill"
                        }
                      />
                    ))}
                  </>
                )}
              </View>
            </View>
          </ThemedView>
        </ScrollView>
        <View
          className="absolute z-50 w-full"
          style={{ bottom: useBottomTabBarHeight() + 75 }}
        >
          <PlayerStatus />
        </View>
      </ThemedView>
    </>
  );
}
