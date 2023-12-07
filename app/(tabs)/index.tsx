import { Pressable, Image, StyleSheet } from "react-native";
import { View, Text, ScrollView } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { calculateAge, toTitleCase } from "../../utility/functions";
import ProgressBar from "../../components/ProgressBar";
import PlayerStatus from "../../components/PlayerStatus";
import { elementalColorMap } from "../../utility/elementColors";
import { Item } from "../../classes/item";
import { useContext, useState } from "react";
import Necromancer from "../../assets/icons/NecromancerSkull";
import PaladinHammer from "../../assets/icons/PaladinHammer";
import blessingDisplay from "../../components/BlessingsDisplay";
import { useColorScheme } from "nativewind";
import SpellDetails from "../../components/SpellDetails";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { observer } from "mobx-react-lite";
import GearStatsDisplay from "../../components/GearStatsDisplay";
import { AntDesign } from "@expo/vector-icons";

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const [showingInventory, setShowingInventory] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    equipped: "mainHand" | "offHand" | "body" | "head" | null;
  } | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<{
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      buffs: string[] | null;
      debuffs:
        | {
            name: string;
            chance: number;
          }[]
        | null;
      summon?: string[] | undefined;
      selfDamage?: number | undefined;
    };
  } | null>(null);

  const playerStateData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  if (!playerStateData || !gameData) throw new Error("missing contexts");
  const { playerState } = playerStateData;
  const { gameState } = gameData;

  function displaySetter(
    item: Item | null,
    equipped: "mainHand" | "offHand" | "body" | "head" | null,
  ) {
    if (item) {
      setSelectedItem({ item: item, equipped: equipped });
      if (item.itemClass == "book" && playerState) {
        const spell = item.getAttachedSpell(playerState.playerClass);
        setSelectedSpell(spell);
      } else {
        setSelectedSpell(null);
      }
    }
  }

  function selectedItemDisplay() {
    if (selectedItem) {
      return (
        <>
          <Pressable
            className="-ml-2 -mt-2"
            onPress={() => {
              setSelectedSpell(null);
              setSelectedItem(null);
            }}
          >
            <AntDesign
              name="close"
              size={28}
              color={colorScheme == "dark" ? "#fafafa" : "#18181b"}
            />
          </Pressable>
          <View className="flex items-center justify-center py-4">
            {selectedItem.item.stats && selectedItem.item.slot ? (
              <View className="pb-4">
                <GearStatsDisplay stats={selectedItem.item.stats} />
              </View>
            ) : null}
            <Text className="text-center">
              {toTitleCase(selectedItem.item.name)}
            </Text>
            <Image source={selectedItem.item.getItemIcon()} />
            <Text>
              {selectedItem.item.itemClass == "bodyArmor"
                ? "Body Armor"
                : toTitleCase(selectedItem.item.itemClass)}
            </Text>
            {selectedItem.item.slot ? (
              <Text className="">
                Fills {toTitleCase(selectedItem.item.slot)} Slot
              </Text>
            ) : null}
            {selectedItem.item.slot ? (
              <View>
                <Pressable
                  onPress={() => moveBetweenEquippedStates()}
                  className={`bg-blue-400 my-4 rounded-lg  active:scale-95 active:opacity-50`}
                >
                  <Text className="px-6 py-4" style={{ color: "white" }}>
                    {selectedItem.equipped ? "Unequip" : `Equip`}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </>
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center"></View>;
    }
  }

  function moveBetweenEquippedStates() {
    if (playerState) {
      if (selectedItem && selectedItem.equipped) {
        playerState?.removeEquipment(selectedItem.equipped);
      } else if (selectedItem) {
        playerState?.equipItem(selectedItem.item);
      }
      setSelectedItem(null);
    }
  }

  function currentEquipmentDisplay() {
    return (
      <View
        className={`${
          selectedItem ? "mr-2 w-1/2 border-r pr-2" : "w-full"
        } flex border-zinc-900 dark:border-zinc-50`}
      >
        <View className="items-center">
          <Text className="mb-2">Head</Text>
          {playerState?.equipment.head ? (
            <Pressable
              className="w-1/4 items-center active:scale-90 active:opacity-50"
              onPress={() => displaySetter(playerState?.equipment.head, "head")}
            >
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
        <View className="mt-2 flex flex-row justify-evenly">
          <View className="-ml-1 mr-2">
            <Text className="mb-2">Main Hand</Text>
            {playerState?.equipment.mainHand &&
            playerState?.equipment.mainHand.name !== "unarmored" ? (
              <Pressable
                className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerState?.equipment.mainHand, "mainHand")
                }
              >
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
          <View className="">
            <Text className="mb-2">Off-Hand</Text>
            {playerState?.equipment.offHand ? (
              <Pressable
                className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerState?.equipment.offHand, "offHand")
                }
              >
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
              <Pressable
                className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerState?.equipment.mainHand, "offHand")
                }
              >
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
            <Pressable
              className="w-1/4 items-center active:scale-90 active:opacity-50"
              onPress={() => displaySetter(playerState?.equipment.body, "body")}
            >
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
          <View className="my-2">
            <GearStatsDisplay stats={playerState.getCurrentEquipmentStats()} />
          </View>
        ) : null}
      </View>
    );
  }

  function magicProficiencySection(
    proficiencies: {
      school: string;
      proficiency: number;
    }[],
  ) {
    return proficiencies.map((magicProficiency, idx) => {
      const color =
        elementalColorMap[
          magicProficiency.school as
            | "fire"
            | "water"
            | "air"
            | "earth"
            | "blood"
            | "summoning"
            | "pestilence"
            | "bone"
            | "holy"
            | "vengeance"
            | "protection"
        ];
      return (
        <View className="my-4 flex w-full flex-col" key={idx}>
          <Text
            className="mx-auto"
            style={{
              color:
                magicProficiency.school == "air" && colorScheme == "light"
                  ? "#71717a"
                  : color.dark,
            }}
          >
            {magicProficiency.school}
          </Text>
          <ProgressBar
            value={magicProficiency.proficiency}
            maxValue={500}
            unfilledColor={color.light}
            filledColor={color.dark}
            borderColor={color.dark}
          />
        </View>
      );
    });
  }

  if (playerState && gameState) {
    const name = playerState.getFullName();
    const magicProficiencies = playerState.magicProficiencies;

    return (
      <>
        <View className="flex-1 justify-between px-4 pt-2">
          <View className="flex flex-row justify-evenly pb-4">
            {playerState?.playerClass == "necromancer" ? (
              <View className="mx-auto w-[30%]">
                <Necromancer
                  width={100}
                  height={100}
                  color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                />
              </View>
            ) : playerState?.playerClass == "paladin" ? (
              <View className="mx-auto w-[30%]">
                <PaladinHammer width={100} height={100} />
              </View>
            ) : (
              <View className="mx-auto w-[30%] scale-x-[-1] transform">
                <WizardHat
                  height={100}
                  width={100}
                  color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                />
              </View>
            )}
            <View className="mx-auto flex w-[40%] flex-col pt-2">
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
            </View>
            <View className="mx-auto w-[30%]">
              {blessingDisplay(playerState.blessing, colorScheme)}
            </View>
          </View>
          <ScrollView>
            <View style={styles.container}>
              <View style={styles.line} />
              <View style={styles.content}>
                <Text className="text-lg">Inventory</Text>
              </View>
              <View style={styles.line} />
            </View>
            <View className="flex flex-row pt-2">
              {currentEquipmentDisplay()}
              {selectedItem ? (
                <View className="mx-auto">
                  <View className="my-auto">{selectedItemDisplay()}</View>
                </View>
              ) : null}
            </View>
            {selectedSpell ? (
              <View className="my-4">
                <SpellDetails spell={selectedSpell} />
              </View>
            ) : null}
            <View className="mx-auto py-4">
              <Pressable onPress={() => setShowingInventory(!showingInventory)}>
                <Image source={require("../../assets/images/items/Bag.png")} />
              </Pressable>
            </View>
            {showingInventory ? (
              <>
                {playerState.inventory.length > 0 ? (
                  <ScrollView horizontal>
                    <View className="my-auto max-h-64 flex-wrap justify-around">
                      {playerState.inventory.map((item) => (
                        <Pressable
                          key={item.id}
                          className="m-2 items-center active:scale-90 active:opacity-50"
                          onPress={() => displaySetter(item, null)}
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
                ) : (
                  <Text className="py-8 text-center italic">
                    Inventory is currently empty
                  </Text>
                )}
              </>
            ) : null}
            <View style={styles.container}>
              <View style={styles.line} />
              <View style={styles.content}>
                <Text className="text-lg">Proficiencies</Text>
              </View>
              <View style={styles.line} />
            </View>
            <View className="flex items-center pb-4">
              {magicProficiencySection(magicProficiencies)}
            </View>
          </ScrollView>
        </View>
        {playerState ? <PlayerStatus displayGoldTop={true} /> : null}
      </>
    );
  }
});
export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
