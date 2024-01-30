import {
  Pressable,
  Image,
  View as NonThemedView,
  Platform,
} from "react-native";
import { View, Text } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { calculateAge, toTitleCase } from "../../utility/functions/misc";
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
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const playerStateData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);

  const headTarget = useRef<NonThemedView>(null);
  const bodyTarget = useRef<NonThemedView>(null);
  const mainHandTarget = useRef<NonThemedView>(null);
  const offHandTarget = useRef<NonThemedView>(null);
  const inventoryTarget = useRef<NonThemedView>(null);

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
        refs.push(inventoryTarget);
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
      <NonThemedView className="flex w-full">
        <NonThemedView className="-mt-[1vh] items-center">
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
                      setStatsLeftPos(x);
                      setStatsTopPos(y);
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
        </NonThemedView>
        <NonThemedView className="flex flex-row justify-evenly">
          <NonThemedView className="-ml-1 -mt-4 mr-2 md:mt-4">
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
                        setStatsLeftPos(x);
                        setStatsTopPos(y);
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
          <NonThemedView className="-mt-4 md:mt-4">
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
                          setStatsLeftPos(x);
                          setStatsTopPos(y);
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
              <NonThemedView className="mx-auto h-12 w-12 items-center rounded-lg bg-zinc-400">
                <Image
                  className="my-auto opacity-50"
                  source={playerState?.equipment.mainHand?.getItemIcon()}
                />
              </NonThemedView>
            ) : (
              <NonThemedView
                ref={offHandTarget}
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
          </NonThemedView>
        </NonThemedView>
        <NonThemedView className="mx-auto -mt-4 items-center md:mt-4">
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
                      setStatsLeftPos(x);
                      setStatsTopPos(y);
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
      </NonThemedView>
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
          className="mx-auto flex h-[55%] w-full flex-wrap rounded-lg border border-zinc-600"
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <NonThemedView
              className="absolute items-center justify-center"
              style={{
                left: `${
                  (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
                }%`,
                top: `${
                  Math.floor(index / 6) * 25 + Math.floor(deviceHeight / 300)
                }%`,
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
                top: `${
                  Math.floor(index / 6) * 25 + Math.floor(deviceHeight / 300)
                }%`,
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
        <View
          className="flex-1"
          style={{
            paddingBottom: useBottomTabBarHeight() + 65,
          }}
        >
          <NonThemedView className="-mx-4 border-b border-zinc-200 py-2 dark:border-zinc-600">
            <NonThemedView className="mx-6 flex-row items-center md:py-12">
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
              <NonThemedView className="flex-1 flex-col justify-center align-middle">
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
            </NonThemedView>
          </NonThemedView>
          <NonThemedView className="flex-1 justify-evenly px-[2vw]">
            {currentEquipmentDisplay()}
            {inventoryRender()}
          </NonThemedView>
          {showingStats && statsLeftPos && statsTopPos ? (
            <View
              className="absolute items-center rounded-md border border-zinc-600 p-4"
              style={{
                width: deviceWidth / 3 - 2,
                backgroundColor:
                  colorScheme == "light"
                    ? "rgba(250, 250, 250, 0.98)"
                    : "rgba(20, 20, 20, 0.95)",
                left: statsLeftPos
                  ? statsLeftPos < deviceWidth * 0.6
                    ? statsLeftPos + 50
                    : statsLeftPos - deviceWidth / 3
                  : undefined,
                top: statsTopPos - 120,
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
              {(showingStats.slot == "one-hand" ||
                showingStats.slot == "two-hand" ||
                showingStats.slot == "off-hand") && (
                <Text className="text-sm italic">
                  {toTitleCase(showingStats.slot)}
                </Text>
              )}
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
        <NonThemedView
          className="absolute z-50 w-full"
          style={{ bottom: useBottomTabBarHeight() + 75 }}
        >
          <PlayerStatus />
        </NonThemedView>
      </>
    );
  }
});
export default HomeScreen;
