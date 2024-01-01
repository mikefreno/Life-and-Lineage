import { Pressable, View as NonThemedView, useColorScheme } from "react-native";
import { Text, ScrollView, View } from "../../../components/Themed";
import { useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { toTitleCase } from "../../../utility/functions";
import { router } from "expo-router";
import Fire from "../../../assets/icons/FireIcon";
import Water from "../../../assets/icons/WaterIcon";
import Air from "../../../assets/icons/AirIcon";
import Earth from "../../../assets/icons/EarthIcon";
import Sun from "../../../assets/icons/SunIcon";
import Swords from "../../../assets/icons/SwordsIcon";
import Shield from "../../../assets/icons/ShieldIcon";
import Drop from "../../../assets/icons/DropIcon";
import HoldingSkull from "../../../assets/icons/HoldingSkull";
import Bones from "../../../assets/icons/BonesIcon";
import Virus from "../../../assets/icons/VirusIcon";

export default function SetBlessing() {
  const { slug } = useLocalSearchParams();
  const [blessing, setBlessing] = useState<string>("");
  const playerClass = slug[0];
  const sex = slug[1];
  const firstName = toTitleCase(slug[2]);
  const lastName = toTitleCase(slug[3]);
  const colorScheme = useColorScheme();
  const blessingRef = useRef<string>();

  function classDependantBlessings() {
    if (playerClass == "mage") {
      return (
        <View className="flex justify-evenly">
          <View className="flex flex-row justify-evenly">
            <Pressable
              onPress={() => {
                setBlessing("fire");
                blessingRef.current = "fire";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "fire"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-6 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Fire
                      height={120}
                      width={90}
                      style={{ marginBottom: 5 }}
                      color={"#ea580c"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#ea580c" }}
                  >
                    Blessing of Fire
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setBlessing("water");
                blessingRef.current = "water";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "water"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-6 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Water
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#3b82f6"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#3b82f6" }}
                  >
                    Blessing of Water
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
          <View className="mt-6 flex flex-row justify-evenly">
            <Pressable
              onPress={() => {
                setBlessing("air");
                blessingRef.current = "air";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "air"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-6 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Air
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#cbd5e1"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#cbd5e1" }}
                  >
                    Blessing of Air
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setBlessing("earth");
                blessingRef.current = "earth";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "earth"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-6 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Earth
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#937D62"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#937D62" }}
                  >
                    Blessing of Earth
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
        </View>
      );
    } else if (playerClass == "necromancer") {
      return (
        <View className="flex justify-evenly">
          <View className="flex flex-row justify-evenly">
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("summoning");
                blessingRef.current = "summoning";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "summoning"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-2 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <HoldingSkull
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#4b5563"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#4b5563" }}
                  >
                    Blessing of Summons
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("pestilence");
                blessingRef.current = "pestilence";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "pestilence"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-2 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Virus
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#84cc16" }}
                  >
                    Blessing of Pestilence
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
          <View className="mt-6 flex flex-row justify-evenly">
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("bone");
                blessingRef.current = "bone";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "bone"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-2 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Bones
                      height={120}
                      width={100}
                      style={{ marginBottom: 5 }}
                      color={"#9ca3af"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#9ca3af" }}
                  >
                    Blessing of Bones
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              className="w-1/2"
              onPress={() => {
                setBlessing("blood");
                blessingRef.current = "blood";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "blood"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-2 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Drop
                      height={120}
                      width={120}
                      style={{ marginBottom: 5 }}
                      color={"#991b1b"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#991b1b" }}
                  >
                    Blessing of Blood
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
        </View>
      );
    } else if (playerClass == "paladin") {
      return (
        <View className="flex justify-evenly">
          <Pressable
            className="mx-auto"
            onPress={() => {
              setBlessing("holy");
              blessingRef.current = "holy";
            }}
          >
            {({ pressed }) => (
              <NonThemedView
                className={`${
                  pressed || blessing == "holy"
                    ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                    : "scale-90"
                } px-6 py-4`}
              >
                <NonThemedView className="mx-auto">
                  <Sun
                    height={120}
                    width={120}
                    style={{ marginBottom: 5 }}
                    color={"#facc15"}
                  />
                </NonThemedView>
                <Text
                  className="text-center text-lg"
                  style={{ color: "#facc15" }}
                >
                  Holy Blessing
                </Text>
              </NonThemedView>
            )}
          </Pressable>
          <View className="-mx-4 mt-6 flex flex-row justify-evenly">
            <Pressable
              onPress={() => {
                setBlessing("vengeance");
                blessingRef.current = "vengeance";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "vengeance"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-2 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Swords
                      height={100}
                      width={100}
                      style={{ marginBottom: 5 }}
                      color={"#cbd5e1"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#cbd5e1" }}
                  >
                    Blessing of Vengeance
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setBlessing("protection");
                blessingRef.current = "protection";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || blessing == "protection"
                      ? "rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "scale-90"
                  } px-2 py-4`}
                >
                  <NonThemedView className="mx-auto">
                    <Shield
                      height={100}
                      width={100}
                      style={{ marginBottom: 5 }}
                      color={"#3b82f6"}
                    />
                  </NonThemedView>
                  <Text
                    className="text-center text-lg"
                    style={{ color: "#3b82f6" }}
                  >
                    Blessing of Protection
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
          </View>
        </View>
      );
    } else throw new Error("invalid class set");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Blessing",
        }}
      />
      <ScrollView>
        <View className="px-6 pb-12">
          <Text className="py-8 text-center text-2xl text-zinc-900 dark:text-zinc-50">
            {`With What Blessing Was ${firstName} ${lastName} Born?`}
          </Text>
          {classDependantBlessings()}
          {blessing ? (
            <NonThemedView className="mx-auto mt-8">
              <Pressable
                onPress={() =>
                  router.push(
                    `/NewGame/Review/${playerClass}/${sex}/${firstName}/${lastName}/${blessingRef.current}`,
                  )
                }
                className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text className="text-xl tracking-widest">Next</Text>
              </Pressable>
            </NonThemedView>
          ) : null}
          <View></View>
        </View>
      </ScrollView>
    </>
  );
}
