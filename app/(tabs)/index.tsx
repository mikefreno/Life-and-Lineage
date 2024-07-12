import { View, Platform } from "react-native";
import { Text, View as ThemedView } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useRef, useState } from "react";
import Necromancer from "../../assets/icons/NecromancerSkull";
import PaladinHammer from "../../assets/icons/PaladinHammer";
import blessingDisplay from "../../components/BlessingsDisplay";
import { useColorScheme } from "nativewind";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { observer } from "mobx-react-lite";
import { Dimensions } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { calculateAge } from "../../utility/functions/misc/age";
import InventoryRender from "../../components/InventoryRender";
import EquipmentDisplay from "../../components/EquipmentDisplay";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const playerStateData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const headTarget = useRef<View>(null);
  const bodyTarget = useRef<View>(null);
  const mainHandTarget = useRef<View>(null);
  const offHandTarget = useRef<View>(null);
  const inventoryTarget = useRef<View>(null);

  const deviceHeight = Dimensions.get("window").height;

  if (!playerStateData || !gameData) throw new Error("missing contexts");
  const { playerState } = playerStateData;
  const { gameState } = gameData;
  const [showIntroTutorial, setShowIntroTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("intro")) ?? false,
  );
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!showIntroTutorial && gameState) {
      gameState.updateTutorialState("intro", true);
    }
  }, [showIntroTutorial]);

  useEffect(() => {
    setShowIntroTutorial(
      (gameState && !gameState.getTutorialState("intro")) ?? false,
    );
  }, [gameState?.tutorialsShown]);

  if (playerState && gameState) {
    const name = playerState.getFullName();
    return (
      <>
        <TutorialModal
          isVisibleCondition={
            showIntroTutorial && gameState.tutorialsEnabled && isFocused
          }
          backFunction={() => setShowIntroTutorial(false)}
          pageOne={{
            title: "Welcome!",
            body: "On this page you can view your inventory (tap the bag) and equip items to you hands, head, or body.",
          }}
          pageTwo={{
            title: "",
            body: "A great place to start is to open your inventory and study the book you were given.",
          }}
          onCloseFunction={() => setShowIntroTutorial(false)}
        />
        <View
          style={{
            marginTop: useHeaderHeight() / 2,
            height: useHeaderHeight() * 0.5,
            backgroundColor:
              playerState.playerClass == "mage"
                ? "#1e40af"
                : playerState.playerClass == "necromancer"
                ? "#6b21a8"
                : "#fcd34d",
            opacity: Platform.OS == "android" ? 1.0 : 0.5,
          }}
        />
        <ThemedView
          className="flex-1"
          style={{
            paddingBottom: useBottomTabBarHeight() + 70,
          }}
        >
          <View className="-mx-2 py-1">
            <View className="mx-6 flex-row items-center md:py-12">
              {playerState?.playerClass == "necromancer" ? (
                <View className="mx-auto">
                  <Necromancer
                    width={deviceHeight / 9 > 100 ? 100 : deviceHeight / 9}
                    height={deviceHeight / 9 > 100 ? 100 : deviceHeight / 9}
                    color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                  />
                </View>
              ) : playerState?.playerClass == "paladin" ? (
                <View className="mx-auto">
                  <PaladinHammer
                    width={deviceHeight / 9 > 100 ? 100 : deviceHeight / 9}
                    height={deviceHeight / 9 > 100 ? 100 : deviceHeight / 9}
                  />
                </View>
              ) : (
                <View className="mx-auto scale-x-[-1] transform">
                  <WizardHat
                    width={deviceHeight / 9 > 100 ? 100 : deviceHeight / 9}
                    height={deviceHeight / 9 > 100 ? 100 : deviceHeight / 9}
                    color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                  />
                </View>
              )}
              <View className="flex-1 flex-col justify-center align-middle">
                <Text className="text-center text-xl dark:text-white">{`${name}`}</Text>
                <Text className="text-center text-xl dark:text-white">{`${playerState.job}`}</Text>
                <Text className="text-center text-xl dark:text-white">{`${
                  playerState
                    ? calculateAge(
                        new Date(playerState.birthdate),
                        new Date(gameState.date),
                      )
                    : "x"
                } years old`}</Text>
              </View>
              <View className="mx-auto">
                {blessingDisplay(
                  playerState.blessing,
                  colorScheme,
                  deviceHeight / 9 > 100 ? 100 : deviceHeight / 9,
                )}
              </View>
            </View>
          </View>
          <View className="flex-1 justify-evenly px-[2vw]">
            <EquipmentDisplay
              headTarget={headTarget}
              bodyTarget={bodyTarget}
              mainHandTarget={mainHandTarget}
              offHandTarget={offHandTarget}
              inventoryTarget={inventoryTarget}
              inventory={playerState.getInventory()}
            />
            <InventoryRender
              selfRef={inventoryTarget}
              headTarget={headTarget}
              bodyTarget={bodyTarget}
              mainHandTarget={mainHandTarget}
              offHandTarget={offHandTarget}
              inventory={playerState.getInventory()}
            />
          </View>
        </ThemedView>
        <View
          className="absolute z-50 w-full"
          style={{ bottom: useBottomTabBarHeight() + 75 }}
        >
          <PlayerStatus />
        </View>
      </>
    );
  }
});
export default HomeScreen;
