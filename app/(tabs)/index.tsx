import {
  Pressable,
  Image,
  View as NonThemedView,
  Animated,
} from "react-native";
import { View, Text } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { calculateAge, toTitleCase } from "../../utility/functions";
import PlayerStatus from "../../components/PlayerStatus";
import { Item } from "../../classes/item";
import { useContext, useEffect, useRef, useState } from "react";
import Necromancer from "../../assets/icons/NecromancerSkull";
import PaladinHammer from "../../assets/icons/PaladinHammer";
import blessingDisplay from "../../components/BlessingsDisplay";
import { useColorScheme } from "nativewind";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { observer } from "mobx-react-lite";
import GearStatsDisplay from "../../components/GearStatsDisplay";
import Draggable from "react-native-draggable";
import { router } from "expo-router";
import { useVibration } from "../../utility/customHooks";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const [showingInventory, setShowingInventory] = useState<boolean>(false);
  const topTranslationValue = useRef(
    new Animated.Value(showingInventory ? -124 : 0),
  ).current;
  const bottomTranslationValue = useRef(
    new Animated.Value(showingInventory ? 72 : 0),
  ).current;
  const playerStateData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);

  const headTarget = useRef<NonThemedView>(null);
  const bodyTarget = useRef<NonThemedView>(null);
  const mainHandTarget = useRef<NonThemedView>(null);
  const offHandTarget = useRef<NonThemedView>(null);

  if (!playerStateData || !gameData) throw new Error("missing contexts");
  const { playerState } = playerStateData;
  const { gameState } = gameData;
  const vibration = useVibration();

  //animation
  useEffect(() => {
    Animated.spring(topTranslationValue, {
      toValue: showingInventory ? -126 : 0,
      useNativeDriver: true,
    }).start();
    Animated.spring(bottomTranslationValue, {
      toValue: showingInventory ? 72 : 0,
      useNativeDriver: true,
    }).start();
  }, [showingInventory]);

  useEffect(() => {}, [showingInventory]);

  interface checkReleasePositonProps {
    item: Item;
    draggable: NonThemedView | null;
    size: number;
  }
  function checkReleasePositon({
    item,
    draggable,
    size,
  }: checkReleasePositonProps) {
    if (draggable) {
      draggable.measure((x, y, width, height, pageX, pageY) => {
        console.log(x);
      });
    }
  }

  function currentEquipmentDisplay() {
    return (
      <View className={`flex border-[#ccc] w-full`}>
        <View className="items-center">
          <Text className="mb-2">Head</Text>
          {playerState?.equipment.head ? (
            <Pressable className="w-1/4 items-center active:scale-90 active:opacity-50">
              <View
                className="rounded-lg p-1.5"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={playerState?.equipment.head?.getItemIcon()} />
              </View>
            </Pressable>
          ) : (
            <View className="mt-2">
              <View
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            </View>
          )}
        </View>
        <View className="flex flex-row justify-evenly">
          <View className="-ml-1 mr-2">
            <Text className="mb-2">Main Hand</Text>
            {playerState?.equipment.mainHand &&
            playerState?.equipment.mainHand.name !== "unarmored" ? (
              <Pressable className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50">
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    source={playerState?.equipment.mainHand.getItemIcon()}
                  />
                </View>
              </Pressable>
            ) : (
              <View
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
          </View>
          <View>
            <Text className="mb-2">Off-Hand</Text>
            {playerState?.equipment.offHand ? (
              <Pressable className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50">
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    source={playerState?.equipment.offHand?.getItemIcon()}
                  />
                </View>
              </Pressable>
            ) : playerState?.equipment.mainHand.slot == "two-hand" ? (
              <Pressable className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50">
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    style={{ opacity: 0.5 }}
                    source={playerState?.equipment.mainHand?.getItemIcon()}
                  />
                </View>
              </Pressable>
            ) : (
              <View
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
          </View>
        </View>
        <View className="mx-auto items-center">
          <Text className="mb-2">Body</Text>
          {playerState?.equipment.body ? (
            <Pressable className="w-1/4 items-center active:scale-90 active:opacity-50">
              <View
                className="rounded-lg p-1.5"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={playerState?.equipment.body?.getItemIcon()} />
              </View>
            </Pressable>
          ) : (
            <View className="mt-2">
              <View
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            </View>
          )}
        </View>
        {playerState ? (
          <NonThemedView className="my-2">
            <GearStatsDisplay stats={playerState.getCurrentEquipmentStats()} />
          </NonThemedView>
        ) : null}
      </View>
    );
  }

  interface ItemRenderProps {
    item: Item;
  }
  const ItemRender = ({ item }: ItemRenderProps) => {
    const [showingStats, setShowingStats] = useState(false);
    const [buzzed, setBuzzed] = useState(false);
    const localRef = useRef<NonThemedView>(null);

    const handlePress = () => {
      vibration({ style: "light" });
      setShowingStats((prevShowingStats) => !prevShowingStats);
    };

    return (
      <NonThemedView className="h-20" ref={localRef}>
        <Draggable
          onDragRelease={() => {
            checkReleasePositon({
              item: item,
              draggable: localRef.current,
              size: 48,
            });
            setBuzzed(false);
          }}
          onDrag={() => {
            if (!buzzed) {
              vibration({ style: "heavy", essential: true });
              setBuzzed(true);
            }
          }}
          shouldReverse
        >
          <NonThemedView className="flex flex-row">
            <Pressable
              className="m-2 items-center active:scale-90 active:opacity-50"
              onPress={handlePress}
            >
              <View
                className="rounded-lg p-2"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={item.getItemIcon()} />
              </View>
            </Pressable>
            {showingStats ? (
              <View
                className="absolute flex items-center rounded-md border border-zinc-600 px-4 py-2 shadow-lg"
                style={{ marginTop: -10, marginLeft: 56, zIndex: 1 }}
              >
                <View style={{ width: 80 }}>
                  <Text className="text-center">{toTitleCase(item.name)}</Text>
                </View>
                {item.stats && item.slot ? (
                  <View className="py-2">
                    <GearStatsDisplay stats={item.stats} />
                  </View>
                ) : null}
                <Text className="text-sm italic">
                  {item.itemClass == "bodyArmor"
                    ? "Body Armor"
                    : toTitleCase(item.itemClass)}
                </Text>
                {item.itemClass == "book" ? (
                  <Pressable
                    onPress={() => {
                      vibration({ style: "light" });
                      router.push("/Study");
                    }}
                    className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                  >
                    <Text>Study This Book</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </NonThemedView>
        </Draggable>
      </NonThemedView>
    );
  };

  if (playerState && gameState) {
    const name = playerState.getFullName();

    return (
      <View className="flex-1">
        <Animated.View
          style={{
            transform: [{ translateY: topTranslationValue }],
            flex: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          <View className="-mx-4 border-b dark:border-zinc-600">
            <View className="mx-4 flex-row pb-4">
              {playerState?.playerClass == "necromancer" ? (
                <NonThemedView className="mx-auto">
                  <Necromancer
                    width={100}
                    height={100}
                    color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                  />
                </NonThemedView>
              ) : playerState?.playerClass == "paladin" ? (
                <NonThemedView className="mx-auto">
                  <PaladinHammer width={100} height={100} />
                </NonThemedView>
              ) : (
                <NonThemedView className="mx-auto scale-x-[-1] transform">
                  <WizardHat
                    height={100}
                    width={100}
                    color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                  />
                </NonThemedView>
              )}
              <NonThemedView className="mx-2 flex-1 flex-col justify-center pt-2 align-middle">
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
              </NonThemedView>
              <NonThemedView className="mx-auto">
                {blessingDisplay(playerState.blessing, colorScheme)}
              </NonThemedView>
            </View>
          </View>
          <View>
            <View className="flex flex-row pt-2">
              {currentEquipmentDisplay()}
            </View>
            <View className="py-2">
              <Pressable
                style={{ width: 55 }}
                onPress={() => {
                  vibration({ style: "light" });
                  setShowingInventory(!showingInventory);
                }}
              >
                <Image
                  source={require("../../assets/images/items/Bag.png")}
                  style={{ width: 50, height: 50 }}
                />
              </Pressable>
            </View>
            {showingInventory ? (
              <>
                {playerState.inventory.length > 0 ? (
                  <View className="flex h-1/2 w-full flex-wrap border border-zinc-600">
                    {playerState.inventory.map((item) => (
                      <ItemRender item={item} key={item.id} />
                    ))}
                  </View>
                ) : (
                  <Text className="py-8 text-center italic">
                    Inventory is currently empty
                  </Text>
                )}
              </>
            ) : null}
          </View>
        </Animated.View>
        {playerState ? (
          <Animated.View
            style={{ transform: [{ translateY: bottomTranslationValue }] }}
          >
            <PlayerStatus displayGoldTop={true} />
          </Animated.View>
        ) : null}
      </View>
    );
  }
});
export default HomeScreen;
