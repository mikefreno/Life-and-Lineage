import { View, Text } from "./Themed";
import {
  Pressable,
  FlatList,
  Image,
  View as NonThemedView,
  Dimensions,
} from "react-native";
import attacks from "../assets/json/playerAttacks.json";
import { toTitleCase } from "../utility/functions";
import { Item } from "../classes/item";
import { useContext, useRef, useState } from "react";
import {
  LogsContext,
  EnemyContext,
  PlayerCharacterContext,
} from "../app/_layout";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";
import { Minion, Enemy } from "../classes/creatures";
import GearStatsDisplay from "./GearStatsDisplay";
import { Attack, Spell } from "../utility/types";
import { elementalColorMap } from "../utility/elementColors";
import Energy from "../assets/icons/EnergyIcon";

interface BattleTabProps {
  battleTab: "attacks" | "equipment" | "log";
  pass: () => void;
  useAttack: (
    attack: {
      name: string;
      targets: string;
      hitChance: number;
      damageMult: number;
      sanityDamage: number;
      debuffs: { name: string; chance: number }[] | null;
    },
    target: Enemy | Minion,
  ) => void;
  useSpell: (
    spell: {
      name: string;
      element: string;
      proficiencyNeeded: number;
      manaCost: number;
      effects: {
        damage: number | null;
        buffs: string[] | null;
        debuffs: { name: string; chance: number }[] | null;
        summon?: string[];
        selfDamage?: number;
      };
    },
    target: Enemy | Minion,
  ) => void;
  attackAnimationOnGoing: boolean;
  setShowTargetSelection: React.Dispatch<
    React.SetStateAction<{
      showing: boolean;
      chosenAttack: any;
      spell: boolean | null;
    }>
  >;
  addItemToPouch: (item: Item) => void;
}

export default function BattleTab({
  battleTab,
  useAttack,
  useSpell,
  pass,
  attackAnimationOnGoing,
  setShowTargetSelection,
  addItemToPouch,
}: BattleTabProps) {
  const { colorScheme } = useColorScheme();
  const logs = useContext(LogsContext)?.logsState;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const selectedItemRef = useRef<Item>();
  const [statsLeftPos, setStatsLeftPos] = useState<number>();
  const [statsTopPos, setStatsTopPos] = useState<number>();

  const deviceHeight = Dimensions.get("window").height;
  const deviceWidth = Dimensions.get("window").width;

  const enemyContext = useContext(EnemyContext);
  const playerContext = useContext(PlayerCharacterContext);
  if (!playerContext || !enemyContext) throw new Error("missing context");
  const { playerState } = playerContext;
  const { enemyState } = enemyContext;

  const playerAttacks = playerState?.physicalAttacks;
  const playerSpells = playerState?.getSpells();
  const vibration = useVibration();

  let attackObjects: {
    name: string;
    targets: string;
    hitChance: number;
    damageMult: number;
    sanityDamage: number;
    debuffs: { name: string; chance: number }[] | null;
  }[] = [];

  playerAttacks?.forEach((plAttack) =>
    attacks.filter((attack) => {
      if (attack.name == plAttack) {
        attackObjects.push(attack);
      }
    }),
  );

  interface ItemRenderProps {
    item: Item;
  }
  const ItemRender = ({ item }: ItemRenderProps) => {
    const localRef = useRef<NonThemedView>(null);
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

  let combinedData: (Attack | Spell)[] = attackObjects.map((attack) => ({
    ...attack,
  }));
  if (playerSpells) {
    combinedData = combinedData.concat(
      playerSpells.map((spell) => ({ ...spell })),
    );
  }

  if (playerState) {
    switch (battleTab) {
      case "attacks":
        return (
          <>
            {!playerState.isStunned() ? (
              <FlatList
                data={combinedData}
                inverted
                renderItem={({ item: attackOrSpell }) => (
                  <NonThemedView
                    className="my-1 rounded border px-4 py-2"
                    style={{
                      backgroundColor:
                        "element" in attackOrSpell
                          ? elementalColorMap[attackOrSpell.element].light
                          : undefined,
                      borderColor:
                        "element" in attackOrSpell
                          ? elementalColorMap[attackOrSpell.element].dark
                          : colorScheme == "light"
                          ? "#71717a"
                          : "#a1a1aa",
                    }}
                  >
                    <NonThemedView className="flex flex-row justify-between">
                      <NonThemedView className="flex flex-col justify-center">
                        <Text
                          className="text-xl"
                          style={{
                            color:
                              "element" in attackOrSpell
                                ? elementalColorMap[attackOrSpell.element].dark
                                : colorScheme == "dark"
                                ? "#fafafa"
                                : "#09090b",
                          }}
                        >
                          {toTitleCase(attackOrSpell.name)}
                        </Text>
                        {"hitChance" in attackOrSpell ? (
                          <Text className="text-lg">{`${
                            attackOrSpell.hitChance * 100
                          }% hit chance`}</Text>
                        ) : (
                          <NonThemedView className="flex flex-row">
                            <Text
                              style={{
                                color:
                                  elementalColorMap[attackOrSpell.element].dark,
                              }}
                            >
                              {attackOrSpell.manaCost}
                            </Text>
                            <NonThemedView className="my-auto pl-1">
                              <Energy
                                height={14}
                                width={14}
                                color={
                                  colorScheme == "dark" ? "#2563eb" : undefined
                                }
                              />
                            </NonThemedView>
                          </NonThemedView>
                        )}
                      </NonThemedView>
                      <Pressable
                        disabled={
                          playerState.isStunned() || attackAnimationOnGoing
                        }
                        onPress={() => {
                          vibration({ style: "light" });
                          if (enemyState && enemyState.minions.length == 0) {
                            if ("element" in attackOrSpell) {
                              useSpell(attackOrSpell, enemyState);
                            } else {
                              useAttack(attackOrSpell, enemyState);
                            }
                          } else {
                            setShowTargetSelection({
                              showing: true,
                              chosenAttack: attackOrSpell,
                              spell: "element" in attackOrSpell ? true : false,
                            });
                          }
                        }}
                        className="mx-2 my-auto rounded px-4 py-2 shadow-sm active:scale-95 active:opacity-50"
                        style={{
                          backgroundColor:
                            "element" in attackOrSpell
                              ? elementalColorMap[attackOrSpell.element].dark
                              : colorScheme == "light"
                              ? "#d4d4d8"
                              : "#27272a",
                        }}
                      >
                        <Text className="text-xl">
                          {playerState.isStunned()
                            ? "Stunned!"
                            : "element" in attackOrSpell
                            ? playerState.mana >= attackOrSpell.manaCost
                              ? "Cast"
                              : "Not Enough Mana"
                            : "Attack"}
                        </Text>
                      </Pressable>
                    </NonThemedView>
                  </NonThemedView>
                )}
              />
            ) : (
              <View className="my-auto px-4 py-2">
                <Text className="text-center text-2xl tracking-wide">
                  Stunned!
                </Text>
                <View className="flex flex-row justify-between">
                  <View className="flex flex-col justify-center">
                    <Text className="text-xl">Pass</Text>
                  </View>
                  <Pressable
                    disabled={attackAnimationOnGoing}
                    onPress={() => {
                      vibration({ style: "light" });
                      pass();
                    }}
                    className="mx-2 my-auto rounded bg-zinc-300 px-4 py-2 active:scale-95 active:opacity-50 dark:bg-zinc-700"
                  >
                    <Text className="text-xl">Use</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        );
      case "equipment":
        return (
          <>
            <NonThemedView className="absolute bottom-0 mx-auto flex h-full w-full flex-wrap rounded-lg border border-zinc-600">
              {Array.from({ length: 24 }).map((_, index) => (
                <NonThemedView
                  className="absolute items-center justify-center"
                  style={{
                    left: `${
                      (index % 6) * 16.67 +
                      1 * (Math.floor(deviceWidth / 400) + 1)
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
                  className="absolute items-center justify-center"
                  style={{
                    left: `${
                      (index % 6) * 16.67 +
                      1 * (Math.floor(deviceWidth / 400) + 1)
                    }%`,
                    top: `${Math.floor(index / 6) * 25 + 4}%`,
                  }}
                  key={index}
                >
                  <ItemRender item={item} />
                </NonThemedView>
              ))}
            </NonThemedView>
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
                <NonThemedView>
                  <Text className="text-center">
                    {toTitleCase(selectedItem.name)}
                  </Text>
                </NonThemedView>
                {selectedItem.stats && selectedItem.slot ? (
                  <NonThemedView className="py-2">
                    <GearStatsDisplay stats={selectedItem.stats} />
                  </NonThemedView>
                ) : null}
                {(selectedItem.slot == "one-hand" ||
                  selectedItem.slot == "two-hand" ||
                  selectedItem.slot == "off-hand") && (
                  <Text className="text-sm italic">
                    {toTitleCase(selectedItem.slot)}
                  </Text>
                )}
                <Text className="text-sm italic">
                  {selectedItem.itemClass == "bodyArmor"
                    ? "Body Armor"
                    : toTitleCase(selectedItem.itemClass)}
                </Text>
                <Pressable
                  onPress={() => {
                    addItemToPouch(
                      selectedItemRef.current
                        ? selectedItemRef.current
                        : selectedItem,
                    );
                    playerState.removeFromInventory(
                      selectedItemRef.current
                        ? selectedItemRef.current
                        : selectedItem,
                    );
                    setSelectedItem(null);
                    selectedItemRef.current = undefined;
                  }}
                  className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text className="text-center">Drop Item</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        );
      case "log":
        return (
          <View
            className="my-2 flex-1 rounded border border-zinc-900 px-4 dark:border-zinc-100"
            style={{
              backgroundColor: colorScheme == "dark" ? "#09090b" : "#fff",
            }}
          >
            <FlatList
              inverted
              data={logs?.slice().reverse()}
              renderItem={({ item }) => <Text className="py-1">{item}</Text>}
            />
          </View>
        );
    }
  }
}
