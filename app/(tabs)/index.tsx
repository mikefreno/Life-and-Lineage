import { Pressable, useColorScheme, Image } from "react-native";
import { View, Text, ScrollView } from "../../components/Themed";
import WizardHat from "../../assets/icons/WizardHatIcon";
import WitchHat from "../../assets/icons/WitchHatIcon";
import { calculateAge, savePlayer, toTitleCase } from "../../utility/functions";
import Coins from "../../assets/icons/CoinsIcon";
import { useDispatch, useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";
import ProgressBar from "../../components/ProgressBar";
import PlayerStatus from "../../components/PlayerStatus";
import { elementalColorMap } from "../../utility/elementColors";
import { Item } from "../../classes/item";
import { useState } from "react";
import { AppDispatch } from "../../redux/store";
import { setPlayerCharacter } from "../../redux/slice/game";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const playerCharacter = useSelector(selectPlayerCharacter);
  const dispatch: AppDispatch = useDispatch();
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    equipped: boolean;
  } | null>(null);

  function displaySetter(item: Item, equipped: boolean) {
    setSelectedItem({ item: item, equipped: equipped });
  }

  function moveBetweenEquippedStates(
    targetSlot: "mainHand" | "head" | "body" | "off-hand",
  ) {
    if (playerCharacter) {
      if (selectedItem && selectedItem?.equipped) {
        playerCharacter?.removeEquipment(targetSlot);
      } else if (selectedItem) {
        playerCharacter?.equipItem(selectedItem.item, targetSlot);
      }
      dispatch(setPlayerCharacter(playerCharacter));
      savePlayer(playerCharacter);
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
              {selectedItem.item.slot == "one-hand" ? (
                <View className="flex flex-row">
                  <Pressable
                    onPress={() => moveBetweenEquippedStates("mainHand")}
                    className={`bg-blue-400 my-4 mr-2 rounded-lg  active:scale-95 active:opacity-50`}
                  >
                    <Text className="px-4 py-4" style={{ color: "white" }}>
                      {selectedItem.equipped ? "Unequip" : `Equip to Main Hand`}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => moveBetweenEquippedStates("off-hand")}
                    className={`bg-blue-400 my-4 rounded-lg  active:scale-95 active:opacity-50`}
                  >
                    <Text className="px-4 py-4" style={{ color: "white" }}>
                      {selectedItem.equipped ? "Unequip" : `Equip to Off-hand`}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  className={`bg-blue-400 my-4 rounded-lg  active:scale-95 active:opacity-50`}
                >
                  <Text className="px-6 py-4" style={{ color: "white" }}>
                    {selectedItem.equipped
                      ? "Unequip"
                      : `Equip to ${selectedItem.item.slot}`}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center"></View>;
    }
  }

  function currentEquipmentDisplay() {
    return (
      <View className="flex">
        <View className="items-center">
          <Text>Head</Text>
          {playerCharacter && playerCharacter.getHeadItem() ? (
            <Pressable
              className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
              onPress={() =>
                displaySetter(playerCharacter.getHeadItem()!, true)
              }
            >
              <View
                className="rounded-lg p-1.5"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={playerCharacter.getHeadItem()!.getItemIcon()} />
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
          <View className="mr-4 items-center">
            <Text>Main Hand</Text>
            {playerCharacter && playerCharacter.getMainHandItem() ? (
              <Pressable
                className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerCharacter.getMainHandItem()!, true)
                }
              >
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    source={playerCharacter.getMainHandItem()!.getItemIcon()}
                  />
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
          <View className="mr-2 items-center">
            <Text>Off-Hand</Text>
            {playerCharacter && playerCharacter.getOffHandItem() ? (
              <Pressable
                className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                onPress={() =>
                  displaySetter(playerCharacter.getOffHandItem()!, true)
                }
              >
                <View
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "#a1a1aa" }}
                >
                  <Image
                    source={playerCharacter.getOffHandItem()!.getItemIcon()}
                  />
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
        <View className="mx-auto items-center">
          <Text>Body</Text>
          {playerCharacter && playerCharacter.getBodyItem() ? (
            <Pressable
              className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
              onPress={() =>
                displaySetter(playerCharacter.getBodyItem()!, true)
              }
            >
              <View
                className="rounded-lg p-1.5"
                style={{ backgroundColor: "#a1a1aa" }}
              >
                <Image source={playerCharacter.getBodyItem()!.getItemIcon()} />
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

  function elementalProficiencySection(
    proficiencies: {
      element: string;
      proficiency: number;
    }[],
  ) {
    return proficiencies.map((elementalProficiency, idx) => {
      const color =
        elementalColorMap[
          elementalProficiency.element as "fire" | "earth" | "air" | "water"
        ];
      return (
        <View className="my-4 flex w-full flex-col" key={idx}>
          <Text
            className="mx-auto"
            style={{
              color:
                elementalProficiency.element == "air" && colorScheme == "light"
                  ? "#71717a"
                  : color.dark,
            }}
          >
            {elementalProficiency.element}
          </Text>
          <ProgressBar
            value={elementalProficiency.proficiency}
            maxValue={500}
            unfilledColor={color.light}
            filledColor={color.dark}
            borderColor={color.dark}
          />
        </View>
      );
    });
  }

  const name = playerCharacter?.getName();
  const jobRes = playerCharacter?.getCurrentJobAndExperience();
  const elementalProficiencies = playerCharacter?.getElementalProficiencies();

  return (
    <View className="flex-1 justify-between px-4 pt-2">
      <View className="flex flex-row pb-4">
        <View className="scale-x-[-1] transform">
          {playerCharacter?.sex == "male" ? (
            <WizardHat
              height={114}
              width={120}
              color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
            />
          ) : (
            <WitchHat
              height={120}
              width={120}
              color={colorScheme == "dark" ? "#7c3aed" : "#4c1d95"}
            />
          )}
        </View>
        <View className="my-auto flex w-2/3 flex-col pl-16">
          <Text className="text-xl dark:text-white">{`${name}`}</Text>
          <Text className="text-xl dark:text-white">{`${jobRes?.title}`}</Text>
          <Text className="text-xl dark:text-white">{`${
            playerCharacter
              ? calculateAge(playerCharacter.birthdate, new Date())
              : "x"
          } years old`}</Text>
        </View>
      </View>
      <ScrollView>
        {selectedItem ? selectedItemDisplay() : null}
        <View className="flex flex-row">
          {currentEquipmentDisplay()}
          <ScrollView>
            <View
              className="flex flex-row flex-wrap justify-around"
              style={{
                backgroundColor: colorScheme == "light" ? "#f4f4f5" : "#020617",
              }}
            >
              {playerCharacter?.getInventory().map((item, idx) => (
                <Pressable
                  key={idx}
                  className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                  onPress={() => displaySetter(item, false)}
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
        </View>
        <View className="flex items-center pb-4">
          {elementalProficiencies
            ? elementalProficiencySection(elementalProficiencies)
            : null}
        </View>
      </ScrollView>
      {playerCharacter ? (
        <View className="flex flex-col">
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
