import { View, Text, ScrollView } from "./Themed";
import { Pressable, FlatList, Image } from "react-native";
import attacks from "../assets/json/playerAttacks.json";
import { toTitleCase } from "../utility/functions";
import Coins from "../assets/icons/CoinsIcon";
import { Item } from "../classes/item";
import { useContext, useState } from "react";
import { LogsContext, PlayerCharacterContext } from "../app/_layout";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";

interface BattleTabProps {
  battleTab: "attacks" | "spells" | "equipment" | "log";
  pass: () => void;
  useAttack: (attack: {
    name: string;
    targets: string;
    hitChance: number;
    damageMult: number;
    sanityDamage: number;
    debuffs: { name: string; chance: number }[] | null;
  }) => void;
  useSpell: (spell: {
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
  }) => void;
  attackAnimationOnGoing: boolean;
}

export default function BattleTab({
  battleTab,
  useAttack,
  useSpell,
  pass,
  attackAnimationOnGoing,
}: BattleTabProps) {
  const { colorScheme } = useColorScheme();
  const logs = useContext(LogsContext)?.logsState;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const playerCharacterData = useContext(PlayerCharacterContext);
  if (!playerCharacterData) throw new Error("missing player");
  const { playerState } = playerCharacterData;

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

  function selectedItemDisplay() {
    if (selectedItem) {
      return (
        <View className="flex items-center justify-center py-4">
          <Text>{toTitleCase(selectedItem.name)}</Text>
          <Image source={selectedItem.getItemIcon()} />
          <Text>
            {selectedItem.itemClass == "bodyArmor"
              ? "Body Armor"
              : toTitleCase(selectedItem.itemClass)}
          </Text>
          {selectedItem.slot ? (
            <Text className="">
              Fills {toTitleCase(selectedItem.slot)} Slot
            </Text>
          ) : null}
        </View>
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center" />;
    }
  }

  if (playerState) {
    switch (battleTab) {
      case "attacks":
        return (
          <>
            <FlatList
              data={attackObjects}
              inverted
              renderItem={({ item: attack }) => (
                <View className="border-t border-zinc-800 py-2 dark:border-zinc-100">
                  <View className="flex flex-row justify-between">
                    <View className="flex flex-col justify-center">
                      <Text className="text-xl">
                        {toTitleCase(attack.name)}
                      </Text>
                      <Text className="text-lg">{`${
                        attack.hitChance * 100
                      }% hit chance`}</Text>
                    </View>
                    <Pressable
                      disabled={
                        playerState.isStunned() || attackAnimationOnGoing
                      }
                      onPress={() => {
                        vibration({ style: "light" });
                        useAttack(attack);
                      }}
                      className="my-auto rounded bg-zinc-300 px-4 py-2 active:scale-95 active:opacity-50 dark:bg-zinc-700"
                    >
                      <Text className="text-xl">
                        {playerState.isStunned() ? "Stunned!" : "Use"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
            <View className="border-t border-zinc-800 py-2 dark:border-zinc-100">
              <View className="flex flex-row justify-between">
                <View className="flex flex-col justify-center">
                  <Text className="text-xl">Pass</Text>
                </View>
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    pass();
                  }}
                  className="my-auto rounded bg-zinc-300 px-4 py-2 active:scale-95 active:opacity-50 dark:bg-zinc-700"
                >
                  <Text className="text-xl">Use</Text>
                </Pressable>
              </View>
            </View>
          </>
        );
      case "spells":
        return (
          <FlatList
            data={playerSpells}
            inverted
            renderItem={({ item: spell }) => (
              <View className="border-t border-zinc-800 py-2 dark:border-zinc-100">
                <View className="flex flex-row justify-between">
                  <View className="flex flex-col justify-center">
                    <Text className="text-xl">{toTitleCase(spell.name)}</Text>
                  </View>
                  <Pressable
                    disabled={
                      playerState.mana <= spell.manaCost ||
                      playerState.isStunned() ||
                      attackAnimationOnGoing
                    }
                    onPress={() => {
                      vibration({ style: "light" });
                      useSpell(spell);
                    }}
                    className={`my-auto rounded  px-4 py-2 active:scale-95 active:opacity-50 ${
                      playerState.mana <= spell.manaCost
                        ? ""
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <Text className="text-xl">
                      {playerState.isStunned()
                        ? "Stunned!"
                        : playerState.mana <= spell.manaCost
                        ? "Not Enough Mana"
                        : "Use"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        );
      case "equipment":
        return (
          <>
            {playerState.inventory.length > 0 ? (
              <View className="flex-1 justify-between">
                <View className="flex flex-row">
                  <ScrollView className="w-1/2">
                    <View className="my-auto flex-row flex-wrap justify-around">
                      {playerState.inventory.map((item) => (
                        <Pressable
                          key={item.id}
                          className="m-2 items-center active:scale-90 active:opacity-50"
                          onPress={() => {
                            setSelectedItem(item);
                          }}
                        >
                          <View
                            className="rounded-lg p-2"
                            style={{ backgroundColor: "#a1a1aa" }}
                          >
                            <Image source={item.getItemIcon()} />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                  <View className="w-1/2">
                    {selectedItem ? (
                      <View className="my-auto">{selectedItemDisplay()}</View>
                    ) : null}
                  </View>
                </View>
                <View className="flex flex-row justify-center pb-2">
                  <Text>{playerState.getReadableGold()}</Text>
                  <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-between pb-2">
                <Text className="py-8 text-center italic">
                  Inventory is currently empty
                </Text>
                <View className="flex flex-row justify-center">
                  <Text>{playerState.getReadableGold()}</Text>
                  <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                </View>
              </View>
            )}
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
