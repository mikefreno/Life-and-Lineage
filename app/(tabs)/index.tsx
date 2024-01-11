import {
  Pressable,
  Image,
  View as NonThemedView,
  Animated,
  Switch,
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
import { Dimensions } from "react-native";
import Modal from "react-native-modal";
import { Entypo } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

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
  const inventoryTarget = useRef<NonThemedView>(null);
  const bagTarget = useRef<NonThemedView>(null);

  if (!playerStateData || !gameData) throw new Error("missing contexts");
  const { playerState } = playerStateData;
  const { gameState } = gameData;
  const vibration = useVibration();
  const [showingStats, setShowingStats] = useState<Item | null>(null);
  const [statsLeftPos, setStatsLeftPos] = useState<number>();
  const [statsTopPos, setStatsTopPos] = useState<number>();
  const [showIntroTutorial, setShowIntroTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("intro")) ?? false,
  );
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );

  const isFocused = useIsFocused();

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

  useEffect(() => {
    if (!showIntroTutorial && gameState) {
      gameState.updateTutorialState("intro", true);
    }
  }, [showIntroTutorial]);

  useEffect(() => {
    setTutorialState(gameState?.tutorialsEnabled ?? true);
  }, [gameState?.tutorialsEnabled]);

  useEffect(() => {
    if (showingInventory) {
      setStatsTopPos((prev) => (prev ? prev - 64 : undefined));
    } else {
      setStatsTopPos((prev) => (prev ? prev + 64 : undefined));
    }
  }, [showingInventory]);

  useEffect(() => {
    setShowIntroTutorial(
      (gameState && !gameState.getTutorialState("intro")) ?? false,
    );
  }, [gameState?.tutorialsShown]);

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    }
  }, [tutorialState]);

  const deviceHeight = Dimensions.get("window").height;
  const deviceWidth = Dimensions.get("window").width;

  interface checkReleasePositonProps {
    item: Item | null;
    xPos: number;
    yPos: number;
    size: number;
    equipped: boolean;
  }

  function checkReleasePositon({
    item,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositonProps) {
    if (item && item.slot) {
      let refs: React.RefObject<NonThemedView>[] = [];
      if (equipped) {
        if (showingInventory) {
          refs.push(inventoryTarget);
        } else {
          refs.push(bagTarget);
        }
      } else {
        switch (item.slot) {
          case "head":
            refs.push(headTarget);
            break;
          case "body":
            refs.push(bodyTarget);
            break;
          case "two-hand":
            refs.push(mainHandTarget, offHandTarget);
            break;
          case "one-hand":
            refs.push(mainHandTarget, offHandTarget);
            break;
          case "off-hand":
            refs.push(offHandTarget);
            break;
        }
      }
      refs.forEach((ref) => {
        ref.current?.measureInWindow(
          (targetX, targetY, targetWidth, targetHeight) => {
            const isWidthAligned =
              xPos + size / 2 >= targetX &&
              xPos - size / 2 <= targetX + targetWidth;
            const isHeightAligned =
              yPos + size / 2 >= targetY &&
              yPos - size / 2 <= targetY + targetHeight;
            if (isWidthAligned && isHeightAligned) {
              vibration({ style: "light", essential: true });
              setShowingStats(null);
              if (
                equipped &&
                playerState &&
                playerState.inventory.length < 24
              ) {
                playerState?.unEquipItem(item);
              } else {
                playerState?.equipItem(item);
              }
            }
          },
        );
      });
    }
  }

  function currentEquipmentDisplay() {
    const [buzzed, setBuzzed] = useState<boolean>(false);

    return (
      <View className={`flex w-full`}>
        <View className="items-center">
          <Text className="mb-2">Head</Text>
          {playerState?.equipment.head ? (
            <Pressable className="h-12 w-12 active:scale-90 active:opacity-50">
              <Draggable
                onDragRelease={(_, g) => {
                  checkReleasePositon({
                    item: playerState.equipment.head,
                    xPos: g.moveX,
                    yPos: g.moveY,
                    size: 48,
                    equipped: true,
                  });
                  setBuzzed(false);
                }}
                onDrag={() => {
                  if (!buzzed) {
                    vibration({ style: "medium", essential: true });
                    setBuzzed(true);
                  }
                }}
                onPressIn={() => {
                  if (
                    showingStats &&
                    playerState.equipment.head &&
                    showingStats.equals(playerState.equipment.head)
                  ) {
                    setShowingStats(null);
                  } else {
                    setShowingStats(playerState.equipment.head);
                    headTarget.current?.measureInWindow((x, y) => {
                      setStatsLeftPos(x - 10);
                      setStatsTopPos(showingInventory ? y : y + 120);
                    });
                  }
                }}
                shouldReverse
              >
                <NonThemedView
                  ref={headTarget}
                  className="h-12 w-12 items-center rounded-lg"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    className="my-auto"
                    source={playerState?.equipment.head?.getItemIcon()}
                  />
                </NonThemedView>
              </Draggable>
            </Pressable>
          ) : (
            <NonThemedView
              ref={headTarget}
              className="mx-auto h-12 w-12 rounded-lg"
              style={{ backgroundColor: "#a1a1aa" }}
            />
          )}
        </View>
        <NonThemedView className="flex flex-row justify-evenly">
          <NonThemedView className="-ml-1 mr-2">
            <Text className="mb-2">Main Hand</Text>
            {playerState?.equipment.mainHand &&
            playerState?.equipment.mainHand.name !== "unarmored" ? (
              <Pressable className="mx-auto h-12 w-12 items-center active:scale-90 active:opacity-50">
                <Draggable
                  onDragRelease={(_, g) => {
                    checkReleasePositon({
                      item: playerState.equipment.mainHand,
                      xPos: g.moveX,
                      yPos: g.moveY,
                      size: 48,
                      equipped: true,
                    });
                    setBuzzed(false);
                  }}
                  onDrag={() => {
                    if (!buzzed) {
                      vibration({ style: "medium", essential: true });
                      setBuzzed(true);
                    }
                  }}
                  onPressIn={() => {
                    if (
                      showingStats &&
                      playerState.equipment.mainHand &&
                      showingStats.equals(playerState.equipment.mainHand)
                    ) {
                      setShowingStats(null);
                    } else {
                      setShowingStats(playerState.equipment.mainHand);
                      mainHandTarget.current?.measureInWindow((x, y) => {
                        setStatsLeftPos(x - 10);
                        setStatsTopPos(showingInventory ? y : y + 120);
                      });
                    }
                  }}
                  shouldReverse
                >
                  <NonThemedView
                    ref={mainHandTarget}
                    className="h-12 w-12 items-center rounded-lg"
                    style={{ backgroundColor: "#a1a1aa" }}
                  >
                    <Image
                      className="my-auto"
                      source={playerState?.equipment.mainHand.getItemIcon()}
                    />
                  </NonThemedView>
                </Draggable>
              </Pressable>
            ) : (
              <NonThemedView
                ref={mainHandTarget}
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
          </NonThemedView>
          <NonThemedView>
            <Text className="mb-2">Off-Hand</Text>
            {playerState?.equipment.offHand ? (
              <NonThemedView className="mx-auto h-12 w-12 items-center active:scale-90 active:opacity-50">
                <Draggable
                  onDragRelease={(_, g) => {
                    checkReleasePositon({
                      item: playerState.equipment.offHand,
                      xPos: g.moveX,
                      yPos: g.moveY,
                      size: 48,
                      equipped: true,
                    });
                    setBuzzed(false);
                  }}
                  onDrag={() => {
                    if (!buzzed) {
                      vibration({ style: "medium", essential: true });
                      setBuzzed(true);
                    }
                  }}
                  shouldReverse
                >
                  <Pressable
                    onPress={() => {
                      if (
                        showingStats &&
                        playerState.equipment.offHand &&
                        showingStats.equals(playerState.equipment.offHand)
                      ) {
                        setShowingStats(null);
                      } else {
                        setShowingStats(playerState.equipment.offHand);
                        offHandTarget.current?.measureInWindow((x, y) => {
                          setStatsLeftPos(x - 10);
                          setStatsTopPos(showingInventory ? y : y + 120);
                        });
                      }
                    }}
                    ref={offHandTarget}
                    className="h-12 w-12 items-center rounded-lg"
                    style={{ backgroundColor: "#a1a1aa" }}
                  >
                    <Image
                      className="my-auto"
                      source={playerState?.equipment.offHand?.getItemIcon()}
                    />
                  </Pressable>
                </Draggable>
              </NonThemedView>
            ) : playerState?.equipment.mainHand.slot == "two-hand" ? (
              <Pressable className="mx-auto h-12 w-12 items-center active:scale-90 active:opacity-50">
                <NonThemedView
                  ref={offHandTarget}
                  className="h-12 w-12 items-center rounded-lg"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    style={{ opacity: 0.5 }}
                    source={playerState?.equipment.mainHand?.getItemIcon()}
                  />
                </NonThemedView>
              </Pressable>
            ) : (
              <NonThemedView
                ref={offHandTarget}
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
          </NonThemedView>
        </NonThemedView>
        <NonThemedView className="mx-auto items-center">
          <Text className="mb-2">Body</Text>
          {playerState?.equipment.body ? (
            <Pressable className="h-12 w-12 active:scale-90 active:opacity-50">
              <Draggable
                onDragRelease={(_, g) => {
                  checkReleasePositon({
                    item: playerState.equipment.body,
                    xPos: g.moveX,
                    yPos: g.moveY,
                    size: 48,
                    equipped: true,
                  });
                  setBuzzed(false);
                }}
                onDrag={() => {
                  if (!buzzed) {
                    vibration({ style: "medium", essential: true });
                    setBuzzed(true);
                  }
                }}
                onPressIn={() => {
                  if (
                    showingStats &&
                    playerState.equipment.body &&
                    showingStats.equals(playerState.equipment.body)
                  ) {
                    setShowingStats(null);
                  } else {
                    setShowingStats(playerState.equipment.body);
                    bodyTarget.current?.measureInWindow((x, y) => {
                      setStatsLeftPos(x - 10);
                      setStatsTopPos(showingInventory ? y : y + 120);
                    });
                  }
                }}
                shouldReverse
              >
                <NonThemedView
                  ref={bodyTarget}
                  className="h-12 w-12 items-center rounded-lg"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    className="my-auto"
                    source={playerState?.equipment.body?.getItemIcon()}
                  />
                </NonThemedView>
              </Draggable>
            </Pressable>
          ) : (
            <NonThemedView
              ref={bodyTarget}
              className="mx-auto h-12 w-12 rounded-lg"
              style={{ backgroundColor: "#a1a1aa" }}
            />
          )}
        </NonThemedView>
        {playerState ? <NonThemedView className="my-2"></NonThemedView> : null}
      </View>
    );
  }

  interface ItemRenderProps {
    item: Item;
  }
  const ItemRender = ({ item }: ItemRenderProps) => {
    const [buzzed, setBuzzed] = useState(false);
    const localRef = useRef<NonThemedView>(null);

    const handlePress = () => {
      vibration({ style: "light" });
      if (showingStats && showingStats.equals(item)) {
        setShowingStats(null);
      } else {
        setShowingStats(item);
        localRef.current?.measureInWindow((x, y) => {
          setStatsLeftPos(x);
          setStatsTopPos(y);
        });
      }
    };

    return (
      <Draggable
        onDragRelease={(_, g) => {
          checkReleasePositon({
            item: item,
            xPos: g.moveX,
            yPos: g.moveY,
            size: 48,
            equipped: false,
          });
          setBuzzed(false);
        }}
        onDrag={() => {
          if (!buzzed) {
            vibration({ style: "medium", essential: true });
            setBuzzed(true);
          }
        }}
        disabled={!item.slot}
        shouldReverse
      >
        <Pressable
          className="h-14 w-14 items-center justify-center rounded-lg bg-zinc-400 active:scale-90 active:opacity-50"
          ref={localRef}
          onPress={handlePress}
        >
          <Image source={item.getItemIcon()} />
        </Pressable>
      </Draggable>
    );
  };

  function inventoryRender() {
    if (playerState) {
      return (
        <NonThemedView
          ref={inventoryTarget}
          className="mx-auto flex h-1/2 w-full flex-wrap rounded-lg border border-zinc-600"
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <NonThemedView
              className="absolute items-center justify-center"
              style={{
                left: `${
                  (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
                }%`,
                top: `${Math.floor(index / 6) * 25 + 4}%`,
              }}
              key={"bg-" + index}
            >
              <NonThemedView className="h-14 w-14 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            </NonThemedView>
          ))}
          {playerState.inventory.slice(0, 24).map((item, index) => (
            <NonThemedView
              className="absolute h-1/4 w-1/6 items-center justify-center"
              style={{
                left: `${
                  (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
                }%`,
                top: `${Math.floor(index / 6) * 25 + 4}%`,
              }}
              key={index}
            >
              <ItemRender item={item} />
            </NonThemedView>
          ))}
        </NonThemedView>
      );
    }
  }

  if (playerState && gameState) {
    const name = playerState.getFullName();

    return (
      <>
        <Modal
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.2}
          animationInTiming={500}
          animationOutTiming={300}
          isVisible={
            showIntroTutorial && gameState.tutorialsEnabled && isFocused
          }
          onBackdropPress={() => setShowIntroTutorial(false)}
          onBackButtonPress={() => setShowIntroTutorial(false)}
        >
          <View
            className="mx-auto w-5/6 rounded-xl px-6 py-4"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              elevation: 1,
              shadowOpacity: 0.25,
              shadowRadius: 5,
            }}
          >
            <View
              className={`flex flex-row ${
                tutorialStep == 2 ? "justify-between" : "justify-end"
              }`}
            >
              {tutorialStep == 2 ? (
                <Pressable onPress={() => setTutorialStep((prev) => prev - 1)}>
                  <Entypo
                    name="chevron-left"
                    size={24}
                    color={colorScheme == "dark" ? "#f4f4f5" : "black"}
                  />
                </Pressable>
              ) : null}
              <Text>{tutorialStep}/2</Text>
            </View>
            {tutorialStep == 1 ? (
              <>
                <Text className="text-center text-2xl">Welcome!</Text>

                <Text className="my-4 text-center text-lg">
                  On this page you can view your inventory (tap the bag) and
                  equip items to you hands, head, or body.
                </Text>
                <View className="mx-auto flex flex-row">
                  <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    ios_backgroundColor="#3e3e3e"
                    thumbColor={"white"}
                    onValueChange={(bool) => setTutorialState(bool)}
                    value={tutorialState}
                  />
                </View>
                <Pressable
                  onPress={() => setTutorialStep((prev) => prev + 1)}
                  className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Next</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="mt-2 text-center">
                  A great place to start is to open your inventory and study the
                  book you were given.
                </Text>
                <View className="mx-auto flex flex-row">
                  <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    ios_backgroundColor="#3e3e3e"
                    thumbColor={"white"}
                    onValueChange={(bool) => setTutorialState(bool)}
                    value={tutorialState}
                  />
                </View>
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    setShowIntroTutorial(false);
                  }}
                  className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </Modal>
        <View className="flex-1">
          <Animated.View
            style={{
              transform: [{ translateY: topTranslationValue }],
              flex: 1,
              paddingHorizontal: 16,
              paddingTop: 8,
            }}
          >
            <View className="-mx-4 border-b border-zinc-200 dark:border-zinc-700">
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
            <NonThemedView>
              <View className="flex flex-row pt-2">
                {currentEquipmentDisplay()}
              </View>
              <NonThemedView className="flex flex-row justify-between">
                <NonThemedView className="py-2">
                  <Pressable
                    ref={bagTarget}
                    style={{ width: 60, height: 60 }}
                    onPress={() => {
                      vibration({ style: "light" });
                      setShowingInventory(!showingInventory);
                      if (
                        showingStats &&
                        !playerState.equippedCheck(showingStats)
                      ) {
                        setShowingStats(null);
                      }
                    }}
                  >
                    <Image
                      source={require("../../assets/images/items/Bag.png")}
                      style={{ width: 50, height: 50 }}
                    />
                  </Pressable>
                </NonThemedView>
                <NonThemedView className="-mt-16">
                  <GearStatsDisplay
                    stats={playerState.getCurrentEquipmentStats()}
                  />
                </NonThemedView>
              </NonThemedView>
              {showingInventory ? inventoryRender() : null}
            </NonThemedView>
          </Animated.View>
          {playerState ? (
            <Animated.View
              style={{ transform: [{ translateY: bottomTranslationValue }] }}
            >
              <PlayerStatus displayGoldTop={true} />
            </Animated.View>
          ) : null}
          {showingStats && statsLeftPos && statsTopPos ? (
            <View
              className="absolute items-center rounded-md border border-zinc-600 p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                elevation: 1,
                shadowOpacity: 0.25,
                shadowRadius: 5,
                width: deviceWidth / 3 - 2,
                backgroundColor:
                  colorScheme == "light"
                    ? "rgba(250, 250, 250, 0.98)"
                    : "rgba(20, 20, 20, 0.95)",
                left: statsLeftPos
                  ? statsLeftPos < deviceWidth * 0.6
                    ? statsLeftPos + deviceWidth / 7
                    : statsLeftPos - deviceWidth / 3 - 5
                  : undefined,
                top: statsTopPos
                  ? statsTopPos - (2.8 * deviceHeight) / 10
                  : undefined,
              }}
            >
              <NonThemedView>
                <Text className="text-center">
                  {toTitleCase(showingStats.name)}
                </Text>
              </NonThemedView>
              {showingStats.stats && showingStats.slot ? (
                <NonThemedView className="py-2">
                  <GearStatsDisplay stats={showingStats.stats} />
                </NonThemedView>
              ) : null}
              <Text className="text-sm italic">
                {showingStats.itemClass == "bodyArmor"
                  ? "Body Armor"
                  : toTitleCase(showingStats.itemClass)}
              </Text>
              {showingStats.itemClass == "book" ? (
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    setShowingStats(null);
                    router.push("/Study");
                  }}
                  className="-mx-4 mt-2 w-full rounded-xl border border-zinc-900 px-2 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text className="text-center">Study This Book</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </>
    );
  }
});
export default HomeScreen;
