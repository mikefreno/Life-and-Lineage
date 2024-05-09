import { RefObject, useContext, useState } from "react";
import { Pressable, View, Image } from "react-native";
import { Text } from "./Themed";
import Draggable from "react-native-draggable";
import type { Item } from "../classes/item";
import { useVibration } from "../utility/customHooks";
import { StatsDisplay } from "./StatsDisplay";
import { checkReleasePositonProps } from "../utility/types";
import { PlayerCharacterContext } from "../app/_layout";

interface EquipmentDisplayProps {
  headTarget: RefObject<View>;
  bodyTarget: RefObject<View>;
  mainHandTarget: RefObject<View>;
  offHandTarget: RefObject<View>;
  inventoryTarget: RefObject<View>;
  inventory: {
    item: Item;
    count: number;
  }[];
}

export default function EquipmentDisplay({
  headTarget,
  bodyTarget,
  mainHandTarget,
  offHandTarget,
  inventoryTarget,
}: EquipmentDisplayProps) {
  const [buzzed, setBuzzed] = useState<boolean>(false);
  const [showingStats, setShowingStats] = useState<Item | null>(null);
  const [statsLeftPos, setStatsLeftPos] = useState<number>();
  const [statsTopPos, setStatsTopPos] = useState<number>();
  const vibration = useVibration();
  const playerStateData = useContext(PlayerCharacterContext);
  if (!playerStateData) throw new Error("missing contexts");
  const { playerState } = playerStateData;

  function checkReleasePositon({
    item,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositonProps) {
    if (item && item.slot) {
      let refs: React.RefObject<View>[] = [];
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

  return (
    <>
      <View className="flex w-full">
        <View className="-mt-3 items-center">
          <Text className="mb-2">Head</Text>
          {playerState?.equipment.head ? (
            <View className="z-50 h-12 w-12 active:scale-90 active:opacity-50">
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
                <View
                  ref={headTarget}
                  className="absolute h-12 w-12 items-center rounded-lg"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    className="my-auto"
                    source={playerState?.equipment.head?.getItemIcon()}
                  />
                </View>
              </Draggable>
            </View>
          ) : (
            <View
              ref={headTarget}
              className="mx-auto h-12 w-12 rounded-lg"
              style={{ backgroundColor: "#a1a1aa" }}
            />
          )}
          <View
            className="absolute mx-auto ml-4 mt-7 h-12 w-12 rounded-lg"
            style={{ backgroundColor: "#a1a1aa" }}
          />
        </View>
        <View className="flex flex-row justify-evenly">
          <View className="-ml-1 -mt-4 mr-2 md:mt-4">
            <Text className="mb-2">Main Hand</Text>
            {playerState?.equipment.mainHand &&
            playerState?.equipment.mainHand.name !== "unarmored" ? (
              <View className="z-50 mx-auto h-12 w-12 items-center active:scale-90 active:opacity-50">
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
                  <View
                    ref={mainHandTarget}
                    className="h-12 w-12 items-center rounded-lg"
                    style={{ backgroundColor: "#a1a1aa" }}
                  >
                    <Image
                      className="my-auto"
                      source={playerState?.equipment.mainHand.getItemIcon()}
                    />
                  </View>
                </Draggable>
              </View>
            ) : (
              <View
                ref={mainHandTarget}
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
            <View
              className="absolute mx-auto ml-4 mt-7 h-12 w-12 rounded-lg"
              style={{ backgroundColor: "#a1a1aa" }}
            />
          </View>
          <View className="-mt-4 md:mt-4">
            <Text className="mb-2">Off-Hand</Text>
            {playerState?.equipment.offHand ? (
              <View className="z-50 mx-auto h-12 w-12 items-center active:scale-90 active:opacity-50">
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
              </View>
            ) : playerState?.equipment.mainHand.slot == "two-hand" ? (
              <View className="z-50 mx-auto h-12 w-12 items-center rounded-lg bg-zinc-400">
                <Image
                  className="my-auto opacity-50"
                  source={playerState?.equipment.mainHand?.getItemIcon()}
                />
              </View>
            ) : (
              <View
                ref={offHandTarget}
                className="mx-auto h-12 w-12 rounded-lg"
                style={{ backgroundColor: "#a1a1aa" }}
              />
            )}
            <View
              className="absolute mx-auto ml-3 mt-7 h-12 w-12 rounded-lg"
              style={{ backgroundColor: "#a1a1aa" }}
            />
          </View>
        </View>
        <View className="mx-auto -mt-6 items-center md:mt-4">
          <Text className="mb-2">Body</Text>
          {playerState?.equipment.body ? (
            <View className="z-50 h-12 w-12 active:scale-90 active:opacity-50">
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
                <View
                  ref={bodyTarget}
                  className="h-12 w-12 items-center rounded-lg"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    className="my-auto"
                    source={playerState?.equipment.body?.getItemIcon()}
                  />
                </View>
              </Draggable>
            </View>
          ) : (
            <View
              ref={bodyTarget}
              className="mx-auto h-12 w-12 rounded-lg"
              style={{ backgroundColor: "#a1a1aa" }}
            />
          )}
          <View
            className="absolute mx-auto ml-4 mt-7 h-12 w-12 rounded-lg"
            style={{ backgroundColor: "#a1a1aa" }}
          />
        </View>
      </View>
      {showingStats && statsLeftPos && statsTopPos && (
        <View className="absolute z-10">
          <StatsDisplay
            statsLeftPos={statsLeftPos}
            statsTopPos={statsTopPos}
            item={showingStats}
            setShowingStats={setShowingStats}
            topOffset={-240}
          />
        </View>
      )}
    </>
  );
}
