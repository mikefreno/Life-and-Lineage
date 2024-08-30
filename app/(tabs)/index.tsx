import { View } from "react-native";
import { Text, View as ThemedView } from "../../components/Themed";
import { useContext, useEffect, useRef, useState } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { calculateAge } from "../../utility/functions/misc/age";
import InventoryRender from "../../components/InventoryRender";
import { AppContext } from "../_layout";
import {
  NecromancerSkull,
  PaladinHammer,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import BlessingDisplay from "../../components/BlessingsDisplay";
import { Item } from "../../classes/item";
import { StatsDisplay } from "../../components/StatsDisplay";
import EquipmentDisplay from "../../components/EquipmentDisplay";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");

  const headTarget = useRef<View>(null);
  const bodyTarget = useRef<View>(null);
  const mainHandTarget = useRef<View>(null);
  const offHandTarget = useRef<View>(null);
  const inventoryTarget = useRef<View>(null);

  const [displayItem, setDisplayItem] = useState<{
    item: Item;
    positon: { left: number; top: number };
  } | null>(null);

  const { playerState, gameState, isCompact, dimensions } = appData;
  const [showIntroTutorial, setShowIntroTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("intro")) ?? false,
  );
  const isFocused = useIsFocused();

  const tabBarHeight = useBottomTabBarHeight();

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
        <ThemedView
          className="flex-1"
          style={{
            paddingTop: useHeaderHeight(),
            paddingBottom: tabBarHeight + (isCompact ? 0 : 28),
          }}
        >
          <View className="p-1 md:py-4">
            <View className="flex-row">
              {playerState?.playerClass == "necromancer" ? (
                <View className="mx-auto">
                  <NecromancerSkull
                    width={
                      dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                    }
                    height={
                      dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                    }
                    color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                  />
                </View>
              ) : playerState?.playerClass == "paladin" ? (
                <View className="mx-auto">
                  <PaladinHammer
                    width={
                      dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                    }
                    height={
                      dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                    }
                  />
                </View>
              ) : (
                <View className="mx-auto scale-x-[-1] transform">
                  <WizardHat
                    width={
                      dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                    }
                    height={
                      dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                    }
                    color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                  />
                </View>
              )}
              <View>
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
                <BlessingDisplay
                  blessing={playerState.blessing}
                  colorScheme={colorScheme}
                  size={
                    dimensions.height / 9 > 100 ? 100 : dimensions.height / 10
                  }
                />
              </View>
            </View>
          </View>
          <View className="flex-1 justify-evenly relative z-10">
            <EquipmentDisplay
              headTarget={headTarget}
              bodyTarget={bodyTarget}
              mainHandTarget={mainHandTarget}
              offHandTarget={offHandTarget}
              inventoryTarget={inventoryTarget}
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
            />
            <InventoryRender
              selfRef={inventoryTarget}
              headTarget={headTarget}
              bodyTarget={bodyTarget}
              mainHandTarget={mainHandTarget}
              offHandTarget={offHandTarget}
              inventory={playerState.getInventory()}
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
            />
          </View>
          {displayItem && (
            <View className="absolute z-10">
              <StatsDisplay
                statsLeftPos={displayItem.positon.left}
                statsTopPos={displayItem.positon.top}
                item={displayItem.item}
                clearItem={() => setDisplayItem(null)}
              />
            </View>
          )}
        </ThemedView>
      </>
    );
  }
});
export default HomeScreen;
