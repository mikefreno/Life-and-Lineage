import { Pressable, TouchableWithoutFeedback, View } from "react-native";
import { Text, ThemedView } from "../../components/Themed";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useColorScheme } from "nativewind";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import InventoryRender from "../../components/InventoryRender";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import BlessingDisplay from "../../components/BlessingsDisplay";
import { StatsDisplay } from "../../components/StatsDisplay";
import EquipmentDisplay from "../../components/EquipmentDisplay";
import { TutorialOption } from "../../utility/types";
import { useDraggableStore, useRootStore } from "../../hooks/stores";
import D20DieAnimation from "../../components/DieRollAnim";
import { EXPANDED_PAD } from "../../components/PlayerStatus";
import type { Item } from "../../entities/item";
import { LayoutAnimation } from "react-native";
import { Image } from "expo-image";
import { StashDisplay } from "../../components/StashDisplay";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const { playerState, uiStore, stashStore } = useRootStore();
  const { draggableClassStore } = useDraggableStore();
  const [showStash, setShowStash] = useState(false);
  const stashButtonRef = useRef(null);

  const [displayItem, setDisplayItem] = useState<{
    item: Item[];
    position: { left: number; top: number };
  } | null>(null);

  const tabBarHeight = useBottomTabBarHeight() + 10;
  const header = useHeaderHeight();
  const isFocused = useIsFocused();

  const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

  const playerIcon = useMemo(() => {
    const iconSize =
      uiStore.dimensions.height / 9 > 100
        ? 100
        : uiStore.dimensions.height / 10;
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
  }, [playerState?.playerClass, uiStore.dimensions.height, colorScheme]);

  if (!playerState) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <D20DieAnimation keepRolling={true} />
      </ThemedView>
    );
  }
  const setStashTargetLayout = () => {
    if (stashButtonRef.current) {
      stashButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        draggableClassStore.setAncillaryBounds("stash", {
          x: pageX,
          y: pageY,
          width,
          height,
        });
      });
    }
  };

  const layoutDimensions = useMemo(
    () => ({
      paddingTop: header,
      paddingBottom:
        tabBarHeight + (uiStore.playerStatusIsCompact ? 0 : EXPANDED_PAD),
    }),
    [header, tabBarHeight, uiStore.playerStatusIsCompact],
  );

  useEffect(() => {
    if (isFocused) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [isFocused]);

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

      <StashDisplay
        clear={() => setShowStash(false)}
        showingStash={showStash}
      />
      <View className="flex-1" style={layoutDimensions}>
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View className="p-1 md:py-4">
            <View className="flex-row">
              <View className="mx-auto">{playerIcon}</View>
              <View className="flex justify-center">
                <Text className="text-center text-xl dark:text-white">
                  {playerState.fullName}
                </Text>
                <Text className="text-center text-xl dark:text-white">
                  {playerState.job}
                </Text>
                <Text className="text-center text-xl dark:text-white">{`${playerState.age} years old`}</Text>
              </View>
              <View className="mx-auto">
                <BlessingDisplay
                  blessing={playerState.blessing}
                  colorScheme={colorScheme}
                  size={
                    uiStore.dimensions.height / 9 > 100
                      ? 100
                      : uiStore.dimensions.height / 10
                  }
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View className="flex-1 justify-between relative z-10 h-full">
            {/*<View className="absolute pl-2 z-top">
              <ScrollView style={{ maxHeight: dimensions.height * 0.3 }}>
                {Array.from(playerState.equipmentStats.entries()).map(
                  ([mod, value]) => {
                    const statInfo = getStatInfo(mod as Modifier);
                    if (!value || value <= 0) return null;

                    const Icon = statInfo.icon;
                    return (
                      <Text key={mod} className="text-center">
                        <Icon height={12} width={12} />{" "}
                        {getTotalValue(mod as Modifier, value)}
                      </Text>
                    );
                  },
                )}
              </ScrollView>
            </View>*/}
            {/* May add this back, but idk if I really want it - cluttered*/}
            <EquipmentDisplay
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
            />
            <Pressable
              ref={stashButtonRef}
              onLayout={setStashTargetLayout}
              onPress={() => setShowStash(true)}
              className="z-top rounded-lg -mt-16 px-4 w-20 h-20"
            >
              <Image
                source={require("../../assets/images/icons/Chest.png")}
                style={{ width: 48, height: 48 }}
              />
            </Pressable>
            <InventoryRender
              screen="home"
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
              targetBounds={[
                {
                  key: "head",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("head"),
                },
                {
                  key: "main-hand",
                  bounds:
                    draggableClassStore.ancillaryBoundsMap.get("main-hand"),
                },
                {
                  key: "off-hand",
                  bounds:
                    draggableClassStore.ancillaryBoundsMap.get("off-hand"),
                },
                {
                  key: "body",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("body"),
                },
                {
                  key: "quiver",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("quiver"),
                },
                {
                  key: "stash",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("stash"),
                },
              ]}
              runOnSuccess={(item) => stashStore.addItem(item)}
            />
          </View>
        </TouchableWithoutFeedback>
        {displayItem && (
          <View className="absolute z-top" pointerEvents="box-none">
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
