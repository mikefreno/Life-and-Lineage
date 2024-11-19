import { TouchableWithoutFeedback, View } from "react-native";
import { Text, ThemedView } from "../../components/Themed";
import { useCallback, useMemo, useRef, useState } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import InventoryRender from "../../components/InventoryRender";
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
import { StatsDisplay } from "../../components/StatsDisplay";
import EquipmentDisplay from "../../components/EquipmentDisplay";
import { TutorialOption } from "../../utility/types";
import { useDraggableStore, useRootStore } from "../../hooks/stores";
import D20DieAnimation from "../../components/DieRollAnim";
import { EXPANDED_PAD } from "../../components/PlayerStatus";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const { playerState, gameState, uiStore, constructed } = useRootStore();
  const { dimensions, playerStatusIsCompact } = uiStore;
  const { setIconString } = useDraggableStore();

  const headTarget = useRef(null);
  const bodyTarget = useRef(null);
  const mainHandTarget = useRef(null);
  const offHandTarget = useRef(null);
  const quiverTarget = useRef(null);
  const inventoryTarget = useRef(null);

  const [displayItem, setDisplayItem] = useState(null);
  const [inventoryBounds, setInventoryBounds] = useState(null);

  const tabBarHeight = useBottomTabBarHeight() + 10;
  const header = useHeaderHeight();
  const isFocused = useIsFocused();

  const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

  const playerIcon = useMemo(() => {
    const iconSize =
      dimensions.window.height / 9 > 100 ? 100 : dimensions.window.height / 10;
    switch (playerState?.playerClass) {
      case "necromancer":
        return (
          <NecromancerSkull
            width={iconSize}
            height={iconSize}
            color={colorScheme === "dark" ? "#9333ea" : "#6b21a8"}
          />
        );
      case "paladin":
        return <PaladinHammer width={iconSize} height={iconSize} />;
      case "mage":
        return (
          <WizardHat
            width={iconSize}
            height={iconSize}
            color={colorScheme === "dark" ? "#2563eb" : "#1e40af"}
          />
        );
      default:
        return <RangerIcon width={iconSize} height={iconSize} />;
    }
  }, [playerState?.playerClass, dimensions.window.height, colorScheme]);

  const playerStats = useMemo(() => {
    if (!playerState || !gameState) return null;
    const name = playerState.fullName;
    const age = playerState.age;
    return { name, job: playerState.job, age };
  }, [playerState, gameState]);

  const equipmentStats = useMemo(() => {
    if (!playerState) return null;
    return playerState.equipmentStats;
  }, [playerState?.equipmentStats]);

  if (!constructed || !playerState || !gameState) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <D20DieAnimation keepRolling={true} />
      </ThemedView>
    );
  }

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.intro}
        isFocused={isFocused}
        pageOne={{
          title: "Welcome!",
          body: "On this page you can view your inventory and equip items to you hands, head, quiver or body.",
        }}
        pageTwo={{
          title: "",
          body: "A great place to start is to study the book you were given.",
        }}
      />
      <View
        className="flex-1"
        style={{
          paddingTop: header,
          paddingBottom:
            tabBarHeight + (playerStatusIsCompact ? 0 : EXPANDED_PAD),
        }}
      >
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View className="p-1 md:py-4">
            <View className="flex-row">
              <View className="mx-auto">{playerIcon}</View>
              <View className="flex justify-center">
                <Text className="text-center text-xl dark:text-white">
                  {playerStats?.name}
                </Text>
                <Text className="text-center text-xl dark:text-white">
                  {playerStats?.job}
                </Text>
                <Text className="text-center text-xl dark:text-white">{`${playerStats?.age} years old`}</Text>
              </View>
              <View className="mx-auto">
                <BlessingDisplay
                  blessing={playerState.blessing}
                  colorScheme={colorScheme}
                  size={
                    dimensions.window.height / 9 > 100
                      ? 100
                      : dimensions.window.height / 10
                  }
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View className="flex-1 justify-between relative z-10 h-full">
            <View className="absolute pl-2">
              {equipmentStats && equipmentStats.damage > 0 && (
                <Text className="text-center">
                  <Sword height={12} width={12} /> {equipmentStats.damage}
                </Text>
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
              setInventoryBounds={setInventoryBounds}
              selfRef={inventoryTarget}
              headTarget={headTarget}
              bodyTarget={bodyTarget}
              mainHandTarget={mainHandTarget}
              offHandTarget={offHandTarget}
              quiverTarget={quiverTarget}
              inventory={playerState.inventory}
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
              setIconString={setIconString}
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
              clearItem={clearDisplayItem}
              tabBarHeight={tabBarHeight}
            />
          </View>
        )}
      </View>
    </>
  );
});

export default HomeScreen;
