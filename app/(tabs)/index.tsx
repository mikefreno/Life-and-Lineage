import { TouchableWithoutFeedback, View } from "react-native";
import { Text, View as ThemedView } from "../../components/Themed";
import { useContext, useRef, useState } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { calculateAge } from "../../utility/functions/misc";
import InventoryRender from "../../components/InventoryRender";
import { AppContext } from "../_layout";
import {
  ArmorIcon,
  Energy,
  HealthIcon,
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  Regen,
  ShieldSlashIcon,
  Sword,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import BlessingDisplay from "../../components/BlessingsDisplay";
import { Item } from "../../classes/item";
import { StatsDisplay } from "../../components/StatsDisplay";
import EquipmentDisplay from "../../components/EquipmentDisplay";
import { TutorialOption } from "../../utility/types";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");

  const headTarget = useRef<View>(null);
  const bodyTarget = useRef<View>(null);
  const mainHandTarget = useRef<View>(null);
  const offHandTarget = useRef<View>(null);
  const quiverTarget = useRef<View>(null);
  const inventoryTarget = useRef<View>(null);

  const [displayItem, setDisplayItem] = useState<{
    item: Item[];
    positon: { left: number; top: number };
  } | null>(null);

  const { playerState, gameState, isCompact, dimensions } = appData;
  const tabBarHeight = useBottomTabBarHeight() + 10;

  if (playerState && gameState) {
    const name = playerState.fullName;
    return (
      <>
        <TutorialModal
          tutorial={TutorialOption.intro}
          isFocused={useIsFocused()}
          pageOne={{
            title: "Welcome!",
            body: "On this page you can view your inventory and equip items to you hands, head, quiver or body.",
          }}
          pageTwo={{
            title: "",
            body: "A great place to start is to study the book you were given.",
          }}
        />
        <ThemedView
          className="flex-1"
          style={{
            paddingTop: useHeaderHeight(),
            paddingBottom: tabBarHeight + (isCompact ? 0 : 28),
          }}
        >
          <TouchableWithoutFeedback onPress={() => setDisplayItem(null)}>
            <View className="p-1 md:py-4">
              <View className="flex-row">
                {playerState?.playerClass == "necromancer" ? (
                  <View className="mx-auto">
                    <NecromancerSkull
                      width={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                      height={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                      color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                    />
                  </View>
                ) : playerState?.playerClass == "paladin" ? (
                  <View className="mx-auto">
                    <PaladinHammer
                      width={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                      height={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                    />
                  </View>
                ) : playerState.playerClass == "mage" ? (
                  <View className="mx-auto scale-x-[-1] transform">
                    <WizardHat
                      width={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                      height={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                      color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                    />
                  </View>
                ) : (
                  <View className="mx-auto">
                    <RangerIcon
                      width={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                      height={
                        dimensions.height / 9 > 100
                          ? 100
                          : dimensions.height / 10
                      }
                    />
                  </View>
                )}
                <View className="flex justify-center">
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
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => setDisplayItem(null)}>
            <View className="flex-1 justify-between relative z-10 h-full">
              <View className="absolute pl-2">
                {playerState.equipmentStats.damage > 0 && (
                  <>
                    <Text className="text-center">
                      <Sword height={12} width={12} />{" "}
                      {playerState.equipmentStats.damage}
                    </Text>
                  </>
                )}
                {playerState.equipmentStats.armor > 0 && (
                  <>
                    <Text className="text-center">
                      <ArmorIcon height={12} width={12} />{" "}
                      {playerState.equipmentStats.armor}
                    </Text>
                  </>
                )}
                {playerState.equipmentStats.blockChance > 0 && (
                  <Text className="text-center">
                    <ShieldSlashIcon height={12} width={12} />{" "}
                    {(playerState.equipmentStats.blockChance * 100).toFixed(1)}%
                  </Text>
                )}
                {playerState.equipmentStats.mana > 0 && (
                  <>
                    <Text className="text-center">
                      <Energy height={12} width={12} />{" "}
                      {playerState.equipmentStats.mana}
                    </Text>
                  </>
                )}
                {playerState.equipmentStats.regen > 0 && (
                  <Text className="text-center">
                    <Regen height={12} width={12} />{" "}
                    {playerState.equipmentStats.regen}
                  </Text>
                )}
                {playerState.equipmentStats.health > 0 && (
                  <Text className="text-center">
                    <HealthIcon height={12} width={12} />{" "}
                    {playerState.equipmentStats.health}
                  </Text>
                )}
              </View>
              <EquipmentDisplay
                headTarget={headTarget}
                bodyTarget={bodyTarget}
                mainHandTarget={mainHandTarget}
                offHandTarget={offHandTarget}
                inventoryTarget={inventoryTarget}
                quiverTarget={quiverTarget}
                displayItem={displayItem}
                setDisplayItem={setDisplayItem}
              />
              <InventoryRender
                selfRef={inventoryTarget}
                headTarget={headTarget}
                bodyTarget={bodyTarget}
                mainHandTarget={mainHandTarget}
                offHandTarget={offHandTarget}
                quiverTarget={quiverTarget}
                inventory={playerState.getInventory()}
                displayItem={displayItem}
                setDisplayItem={setDisplayItem}
                keyItemInventory={
                  playerState.keyItems.length > 0
                    ? playerState.keyItems
                    : undefined
                }
              />
            </View>
          </TouchableWithoutFeedback>
          {displayItem && (
            <View className="absolute z-10">
              <StatsDisplay
                displayItem={displayItem}
                clearItem={() => setDisplayItem(null)}
                tabBarHeight={tabBarHeight}
              />
            </View>
          )}
        </ThemedView>
      </>
    );
  }
});
export default HomeScreen;
