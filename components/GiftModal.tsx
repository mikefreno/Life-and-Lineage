import React from "react";
import { useRef, useState } from "react";
import GenericModal from "./GenericModal";
import { Dimensions, Pressable, View, Image } from "react-native";
import { Text } from "./Themed";
import { toTitleCase } from "../utility/functions/misc";
import GearStatsDisplay from "./GearStatsDisplay";
import type { Item } from "../entities/item";
import { useRootStore } from "../hooks/stores";
import { radius, useStyles } from "../hooks/styles";
import { Colors } from "react-native/Libraries/NewAppScreen";

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
  const { playerState, uiStore } = useRootStore();
  const styles = useStyles();
  const theme = Colors[uiStore.colorScheme];

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
        {({ pressed }) => (
          <View
            style={{
              ...styles.itemsCenter,
              ...radius.lg,
              height: 56,
              width: 56,
              backgroundColor: "#a1a1aa",
              transform: [{ scale: pressed ? 0.9 : 1 }],
              opacity: pressed ? 0.5 : 1,
            }}
          >
            <Image source={item.getItemIcon()} />
          </View>
        )}
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
        <View
          style={{
            position: "absolute",
            bottom: 0,
            ...styles.mxAuto,
            height: "100%",
            width: "100%",
            ...styles.wrap,
            ...radius.lg,
          }}
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <View
              style={{
                position: "absolute",
                ...styles.itemsCenter,
                left: `${
                  (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
                }%`,
                top: `${Math.floor(index / 6) * 25 + 4}%`,
              }}
              key={"bg-" + index}
            >
              <View
                style={{
                  height: 56,
                  width: 56,
                  ...radius.lg,
                  backgroundColor:
                    uiStore.colorScheme === "dark" ? "#3f3f46" : "#e4e4e7",
                }}
              />
            </View>
          ))}
          {playerState!.baseInventory.slice(0, 24).map((item, index) => (
            <View
              style={{
                position: "absolute",
                ...styles.itemsCenter,
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
            style={{
              position: "absolute",
              ...styles.itemsCenter,
              ...radius.md,
              borderWidth: 1,
              borderColor: theme.border,
              ...styles.p4,
              shadowColor: theme.shadow,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              elevation: 1,
              shadowOpacity: 0.25,
              shadowRadius: 5,
              width: deviceWidth / 3 - 2,
              backgroundColor:
                uiStore.colorScheme == "light"
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
              <Text style={styles.textCenter}>
                {toTitleCase(selectedItem.name)}
              </Text>
            </View>
            {selectedItem.stats && selectedItem.slot ? (
              <View style={styles.py2}>
                <GearStatsDisplay stats={selectedItem.stats} />
              </View>
            ) : null}
            {(selectedItem.slot == "one-hand" ||
              selectedItem.slot == "two-hand" ||
              selectedItem.slot == "off-hand") && (
              <Text style={styles.sm}>{toTitleCase(selectedItem.slot)}</Text>
            )}
            <Text style={styles.sm}>
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
