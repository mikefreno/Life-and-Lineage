import { useRef, useState } from "react";
import GenericModal from "./GenericModal";
import { Dimensions, Pressable, View, Image } from "react-native";
import { Text } from "./Themed";
import { Item } from "../classes/item";
import { useColorScheme } from "nativewind";
import { toTitleCase } from "../utility/functions/misc";
import GearStatsDisplay from "./GearStatsDisplay";
import { useGameState } from "../stores/AppData";

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

interface GiftModalProps {
  showing: boolean;
  onCloseFunction: () => void;
  backdropCloses: boolean;
}

export default function GiftModal({
  showing,
  onCloseFunction,
  backdropCloses = false,
}: GiftModalProps) {
  const { colorScheme } = useColorScheme();
  const { playerState } = useGameState();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const selectedItemRef = useRef<Item>();
  const [statsLeftPos, setStatsLeftPos] = useState<number>();
  const [statsTopPos, setStatsTopPos] = useState<number>();

  interface ItemRenderProps {
    item: Item;
  }
  const ItemRender = ({ item }: ItemRenderProps) => {
    const localRef = useRef<View>(null);
    return (
      <Pressable
        ref={localRef}
        className="h-14 w-14 items-center justify-center rounded-lg bg-zinc-400 active:scale-90 active:opacity-50"
        onPress={() => {
          if (selectedItem?.equals(item)) {
            setSelectedItem(null);
            selectedItemRef.current = undefined;
            setStatsLeftPos(undefined);
            setStatsTopPos(undefined);
          } else {
            setSelectedItem(item);
            selectedItemRef.current = item;
            localRef.current?.measureInWindow((x, y) => {
              setStatsLeftPos(x);
              setStatsTopPos(y);
            });
          }
        }}
      >
        <Image source={item.getItemIcon()} />
      </Pressable>
    );
  };
  return (
    <GenericModal
      backdropCloses={backdropCloses}
      isVisibleCondition={showing}
      backFunction={onCloseFunction}
    >
      <>
        <View className="absolute bottom-0 mx-auto flex h-full w-full flex-wrap rounded-lg">
          {Array.from({ length: 24 }).map((_, index) => (
            <View
              className="absolute items-center justify-center"
              style={{
                left: `${
                  (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
                }%`,
                top: `${Math.floor(index / 6) * 25 + 4}%`,
              }}
              key={"bg-" + index}
            >
              <View className="h-14 w-14 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            </View>
          ))}
          {playerState!.inventory.slice(0, 24).map((item, index) => (
            <View
              className="absolute items-center justify-center"
              style={{
                left: `${
                  (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
                }%`,
                top: `${Math.floor(index / 6) * 25 + 4}%`,
              }}
              key={index}
            >
              <ItemRender item={item} />
            </View>
          ))}
        </View>
        {selectedItem && statsLeftPos && statsTopPos ? (
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
                  ? statsLeftPos + deviceWidth / 10
                  : statsLeftPos - deviceWidth / 3 - 5
                : undefined,
              top: statsTopPos
                ? statsTopPos -
                  (2.8 * deviceHeight) /
                    (statsTopPos < deviceHeight * 0.6 ? 6 : 4.5)
                : undefined,
            }}
          >
            <View>
              <Text className="text-center">
                {toTitleCase(selectedItem.name)}
              </Text>
            </View>
            {selectedItem.stats && selectedItem.slot ? (
              <View className="py-2">
                <GearStatsDisplay stats={selectedItem.stats} />
              </View>
            ) : null}
            {(selectedItem.slot == "one-hand" ||
              selectedItem.slot == "two-hand" ||
              selectedItem.slot == "off-hand") && (
              <Text className="text-sm">{toTitleCase(selectedItem.slot)}</Text>
            )}
            <Text className="text-sm">
              {selectedItem.itemClass == "bodyArmor"
                ? "Body Armor"
                : toTitleCase(selectedItem.itemClass)}
            </Text>
          </View>
        ) : null}
      </>
    </GenericModal>
  );
}
