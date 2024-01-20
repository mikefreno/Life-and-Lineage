import { ScrollView, View, Text } from "../../components/Themed";
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
import { Pressable, StyleSheet } from "react-native";
import { useVibration } from "../../utility/customHooks";

export default function MedicalScreen() {
  const gameContext = useContext(GameContext);
  const isFocused = useIsFocused();

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
    gameState?.setMedicalOptionVisibility("health", showingHealthOptions);
  }, [showingHealthOptions]);

  useEffect(() => {
    gameState?.setMedicalOptionVisibility("mana", showingManaOptions);
  }, [showingManaOptions]);

  useEffect(() => {
    gameState?.setMedicalOptionVisibility("sanity", showingSanityOptions);
  }, [showingSanityOptions]);

  useEffect(() => {
    gameState?.setMedicalOptionVisibility("other", showingOtherOptions);
  }, [showingOtherOptions]);

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
          body: "Here you can aquire various forms of medical treatment.",
        }}
        pageTwo={{
          title: "Note: These tick the game clock forward",
          body: "Using items such as potions, or using spells will not tick the clock forward.",
        }}
      />
      <View className="flex-1">
        <PlayerStatus onTop={true} displayGoldBottom={true} />
        <View className="flex flex-row justify-evenly border-b border-zinc-200 py-2 dark:border-zinc-700">
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
        </View>
        <ScrollView>
          <View className="px-2 pb-24">
            {showingHealthOptions && (
              <>
                <View style={styles.container}>
                  <View style={styles.line} />
                  <View style={styles.content}>
                    <Text className="text-xl">Health</Text>
                  </View>
                  <View style={styles.line} />
                </View>
                {healthOptions.map((medOption, index) => {
                  return (
                    <MedicalOption
                      key={index}
                      title={medOption.serviceName}
                      cost={medOption.cost}
                      healthRestore={medOption.heathRestore as number | "fill"}
                    />
                  );
                })}
              </>
            )}
            {showingManaOptions && (
              <>
                <View style={styles.container}>
                  <View style={styles.line} />
                  <View style={styles.content}>
                    <Text className="text-xl">Mana</Text>
                  </View>
                  <View style={styles.line} />
                </View>
                {manaOptions.map((medOption, index) => {
                  return (
                    <MedicalOption
                      key={index}
                      title={medOption.serviceName}
                      cost={medOption.cost}
                      manaRestore={medOption.manaRestore as number | "fill"}
                    />
                  );
                })}
              </>
            )}
            {showingSanityOptions && (
              <>
                <View style={styles.container}>
                  <View style={styles.line} />
                  <View style={styles.content}>
                    <Text className="text-xl">Sanity</Text>
                  </View>
                  <View style={styles.line} />
                </View>
                {sanityOptions.map((medOption, index) => {
                  return (
                    <MedicalOption
                      key={index}
                      title={medOption.serviceName}
                      cost={medOption.cost}
                      sanityRestore={medOption.sanityRestore as number | "fill"}
                    />
                  );
                })}
              </>
            )}
            {showingOtherOptions && (
              <>
                <View style={styles.container}>
                  <View style={styles.line} />
                  <View style={styles.content}>
                    <Text className="text-xl">Other</Text>
                  </View>
                  <View style={styles.line} />
                </View>
                {otherOptions.map((medOption, index) => {
                  return (
                    <MedicalOption
                      key={index}
                      title={medOption.serviceName}
                      cost={medOption.cost}
                      removeDebuffs={medOption.removeDebuffs as number | "all"}
                    />
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
