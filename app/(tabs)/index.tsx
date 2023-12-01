import { Pressable, Image } from "react-native";
import { View, Text, ScrollView } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { calculateAge, toTitleCase } from "../../utility/functions";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../../redux/selectors";
import ProgressBar from "../../components/ProgressBar";
import PlayerStatus from "../../components/PlayerStatus";
import { elementalColorMap } from "../../utility/elementColors";
import { Item } from "../../classes/item";
import { useEffect, useState } from "react";
import { AppDispatch } from "../../redux/store";
import Necromancer from "../../assets/icons/NecromancerSkull";
import PaladinHammer from "../../assets/icons/PaladinHammer";
import blessingDisplay from "../../components/BlessingsDisplay";
import { useColorScheme } from "nativewind";
import SpellDetails from "../../components/SpellDetails";
import { setPlayerCharacter } from "../../redux/slice/player";

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);
  const dispatch: AppDispatch = useDispatch();
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

  function displaySetter(
    item: Item | null,
    equipped: "mainHand" | "offHand" | "body" | "head" | null,
  ) {
    if (item) {
      setSelectedItem({ item: item, equipped: equipped });
      if (item.itemClass == "book" && playerCharacter) {
        const spell = item.getAttachedSpell(playerCharacter.playerClass);
        setSelectedSpell(spell);
      } else {
        setSelectedSpell(null);
      }
    }
  }

  function selectedItemDisplay() {
    if (selectedItem) {
      return (
        <View className="flex items-center justify-center py-4">
          <Text>{toTitleCase(selectedItem.item.name)}</Text>
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
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center"></View>;
    }
  }

  function moveBetweenEquippedStates() {
    if (playerCharacter) {
      if (selectedItem && selectedItem.equipped) {
        playerCharacter?.removeEquipment(selectedItem.equipped);
      } else if (selectedItem) {
        playerCharacter?.equipItem(selectedItem.item);
      }
      setSelectedItem(null);
      dispatch(setPlayerCharacter(playerCharacter.toJSON()));
    }
  }

  function currentEquipmentDisplay() {
    return (
      <View className="mr-2 flex border-r border-zinc-900 pr-2 dark:border-zinc-50">
        <View className="items-center">
          <Text className="mb-2">Head</Text>
          {playerCharacter?.getHeadItem() ? (
            <Pressable
              className="w-1/4 items-center active:scale-90 active:opacity-50"
              onPress={() =>
                displaySetter(playerCharacter.getHeadItem(), "head")
              }
            >
              <View
                className="rounded-lg p-1.5"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={playerCharacter.getHeadItem()?.getItemIcon()} />
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
        <View className="mt-2 flex flex-row">
          <View className="">
            <Text className="mb-2">Main Hand</Text>
            {playerCharacter?.getMainHandItem() &&
            playerCharacter?.getMainHandItem().name !== "unarmored" ? (
              <Pressable
                className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerCharacter?.getMainHandItem(), "mainHand")
                }
              >
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    source={playerCharacter?.getMainHandItem().getItemIcon()}
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
          <View className="ml-6 mr-2">
            <Text className="mb-2">Off-Hand</Text>
            {playerCharacter?.getOffHandItem() ? (
              <Pressable
                className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerCharacter?.getOffHandItem(), "offHand")
                }
              >
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    source={playerCharacter?.getOffHandItem()?.getItemIcon()}
                  />
                </View>
              </Pressable>
            ) : playerCharacter?.getMainHandItem().slot == "two-hand" ? (
              <Pressable
                className="mx-auto w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerCharacter?.getMainHandItem(), "offHand")
                }
              >
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    style={{ opacity: 0.5 }}
                    source={playerCharacter?.getMainHandItem()?.getItemIcon()}
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
          {playerCharacter?.getBodyItem() ? (
            <Pressable
              className="w-1/4 items-center active:scale-90 active:opacity-50"
              onPress={() =>
                displaySetter(playerCharacter?.getBodyItem(), "body")
              }
            >
              <View
                className="rounded-lg p-1.5"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={playerCharacter?.getBodyItem()?.getItemIcon()} />
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

  if (playerCharacter && gameData) {
    const name = playerCharacter.getName();
    const jobRes = playerCharacter.getCurrentJobAndExperience();
    const magicProficiencies = playerCharacter.getMagicalProficiencies();

    return (
      <>
        <View className="flex-1 justify-between px-4 pt-2">
          <View className="flex flex-row justify-evenly pb-4">
            {playerCharacter?.playerClass == "necromancer" ? (
              <View className="m-auto w-1/3">
                <Necromancer
                  width={100}
                  height={100}
                  color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                />
              </View>
            ) : playerCharacter?.playerClass == "paladin" ? (
              <View className="m-auto w-1/3">
                <PaladinHammer width={100} height={100} />
              </View>
            ) : (
              <View className="m-auto w-1/3 scale-x-[-1] transform">
                <WizardHat
                  height={100}
                  width={100}
                  color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                />
              </View>
            )}
            <View className="mx-auto flex w-1/3 flex-col pt-2">
              <Text className="text-center text-xl dark:text-white">{`${name}`}</Text>
              <Text className="text-center text-xl dark:text-white">{`${jobRes?.title}`}</Text>
              <Text className="text-center text-xl dark:text-white">{`${
                playerCharacter
                  ? calculateAge(
                      new Date(playerCharacter.birthdate),
                      gameData.getGameDate(),
                    )
                  : "x"
              } years old`}</Text>
            </View>
            <View className="m-auto">
              {blessingDisplay(playerCharacter.blessing, colorScheme)}
            </View>
          </View>
          <ScrollView>
            <View className="flex flex-row">
              {currentEquipmentDisplay()}
              <View className="mx-auto">
                {selectedItem ? (
                  <View className="my-auto">{selectedItemDisplay()}</View>
                ) : null}
              </View>
            </View>
            {selectedSpell ? (
              <View className="my-4">
                <SpellDetails spell={selectedSpell} />
              </View>
            ) : null}
            <View className="pb-4">
              <Pressable onPress={() => setShowingInventory(!showingInventory)}>
                <Image source={require("../../assets/images/items/Bag.png")} />
              </Pressable>
            </View>
            {showingInventory ? (
              <>
                {playerCharacter.getInventory().length > 0 ? (
                  <ScrollView horizontal>
                    <View className="my-auto max-h-64 flex-wrap justify-around">
                      {playerCharacter.getInventory().map((item) => (
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
            <View className="flex items-center pb-4">
              {magicProficiencySection(magicProficiencies)}
            </View>
          </ScrollView>
        </View>
        {playerCharacter ? <PlayerStatus displayGoldTop={true} /> : null}
      </>
    );
  }
}
