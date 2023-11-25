import { Pressable, useColorScheme, Image } from "react-native";
import { View, Text, ScrollView } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { calculateAge, savePlayer, toTitleCase } from "../../utility/functions";
import Coins from "../../assets/icons/CoinsIcon";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../../redux/selectors";
import ProgressBar from "../../components/ProgressBar";
import PlayerStatus from "../../components/PlayerStatus";
import { elementalColorMap } from "../../utility/elementColors";
import { Item } from "../../classes/item";
import { useEffect, useState } from "react";
import { AppDispatch } from "../../redux/store";
import { setPlayerCharacter } from "../../redux/slice/game";
import Necromancer from "../../assets/icons/NecromancerSkull";
import PaladinHammer from "../../assets/icons/PaladinHammer";
import Fire from "../../assets/icons/FireIcon";
import Water from "../../assets/icons/WaterIcon";
import Air from "../../assets/icons/AirIcon";
import Earth from "../../assets/icons/EarthIcon";
import Sun from "../../assets/icons/SunIcon";
import Swords from "../../assets/icons/SwordsIcon";
import Shield from "../../assets/icons/ShieldIcon";
import HoldingSkull from "../../assets/icons/HoldingSkull";
import Virus from "../../assets/icons/VirusIcon";
import Bones from "../../assets/icons/BonesIcon";
import Drop from "../../assets/icons/DropIcon";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);
  const dispatch: AppDispatch = useDispatch();
  const [playerInventory, setPlayerInventory] = useState<Item[] | undefined>(
    playerCharacter?.getInventory(),
  );
  const [showingInventory, setShowingInventory] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    equipped: "mainHand" | "offHand" | "body" | "head" | null;
  } | null>(null);

  function displaySetter(
    item: Item | null,
    equipped: "mainHand" | "offHand" | "body" | "head" | null,
  ) {
    if (item) setSelectedItem({ item: item, equipped: equipped });
  }

  useEffect(() => {
    setPlayerInventory(playerCharacter?.getInventory());
  }, [playerCharacter]);

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
      dispatch(setPlayerCharacter(playerCharacter));
      savePlayer(playerCharacter);
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
          magicProficiency.school as "fire" | "earth" | "air" | "water"
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

  function blessingDisplay() {
    switch (playerCharacter?.blessing) {
      case "fire":
        return (
          <Fire
            height={100}
            width={90}
            style={{ marginBottom: 5 }}
            color={"#ea580c"}
          />
        );
      case "water":
        return (
          <Water
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#3b82f6"}
          />
        );
      case "air":
        return (
          <Air
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#cbd5e1"}
          />
        );
      case "earth":
        return (
          <Earth
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#937D62"}
          />
        );
      case "holy":
        return (
          <Sun
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#facc15"}
          />
        );
      case "protection":
        return (
          <Shield
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#3b82f6"}
          />
        );
      case "vengeance":
        return (
          <Swords
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#cbd5e1"}
          />
        );
      case "blood":
        return (
          <Drop
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#991b1b"}
          />
        );
      case "bone":
        return (
          <Bones
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#9ca3af"}
          />
        );
      case "summons":
        return (
          <HoldingSkull
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={"#4b5563"}
          />
        );
      case "pestilence":
        return (
          <Virus
            height={100}
            width={100}
            style={{ marginBottom: 5 }}
            color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
          />
        );
    }
  }

  if (playerCharacter && gameData) {
    const name = playerCharacter.getName();
    const jobRes = playerCharacter.getCurrentJobAndExperience();
    const magicProficiencies = playerCharacter.getMagicalProficiencies();

    return (
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
                    playerCharacter.birthdate,
                    gameData.getGameDate(),
                  )
                : "x"
            } years old`}</Text>
          </View>
          <View className="m-auto">{blessingDisplay()}</View>
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
          <View className="py-4">
            <Pressable onPress={() => setShowingInventory(!showingInventory)}>
              <Image source={require("../../assets/images/items/Bag.png")} />
            </Pressable>
          </View>
          {showingInventory ? (
            <>
              {playerCharacter.getInventory().length > 0 ? (
                <ScrollView horizontal>
                  <View className="my-auto max-h-64 flex-wrap justify-around">
                    {playerInventory?.map((item) => (
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
        {playerCharacter ? (
          <View className="mb-1 flex flex-col">
            <View className="flex flex-row justify-center pt-2">
              <Text>{playerCharacter.getReadableGold()}</Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
            <PlayerStatus />
          </View>
        ) : null}
      </View>
    );
  }
}
