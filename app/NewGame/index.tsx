import { Pressable, useColorScheme } from "react-native";
import { Text, View, ScrollView } from "../../components/Themed";
import { View as NonThemedView } from "react-native";
import "../../assets/styles/globals.css";
import { useRef, useState } from "react";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { Stack, router } from "expo-router";
import Necromancer from "../../assets/icons/NecromancerSkull";
import PaladinHammer from "../../assets/icons/PaladinHammer";

export default function NewGameScreen() {
  const [selectedClass, setSelectedClass] = useState<
    "mage" | "necromancer" | "paladin"
  >();
  let classRef = useRef<"mage" | "necromancer" | "paladin">();
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Class Select",
        }}
      />
      <ScrollView className="h-full">
        <Text className="bold pt-4 text-center text-3xl">
          Create a Character
        </Text>
        <View className="">
          <View className="mx-auto my-2 w-4/5">
            <Text className="pt-2 text-center text-2xl">Select Class</Text>
            <Pressable
              className="mx-auto my-8"
              onPress={() => {
                setSelectedClass("mage");
                classRef.current = "mage";
              }}
            >
              {({ pressed }) => (
                <NonThemedView
                  className={`${
                    pressed || selectedClass == "mage"
                      ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                      : "border-transparent"
                  } px-6 py-4 border`}
                >
                  <WizardHat
                    height={120}
                    width={120}
                    style={{ marginBottom: 5 }}
                    color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                  />
                  <Text
                    className="mx-auto text-xl"
                    style={{ color: "#2563eb" }}
                  >
                    Mage
                  </Text>
                </NonThemedView>
              )}
            </Pressable>
            {selectedClass == "mage" ? (
              <Text className="h-16 text-center">
                The Mage is the default class, it is well balanced, with a focus
                on casting elemental magic
              </Text>
            ) : (
              <View className="h-16" />
            )}
            <NonThemedView className="flex flex-row justify-between">
              <Pressable
                className="-ml-2"
                onPress={() => {
                  setSelectedClass("necromancer");
                  classRef.current = "necromancer";
                }}
              >
                {({ pressed }) => (
                  <NonThemedView
                    className={`${
                      pressed || selectedClass == "necromancer"
                        ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                        : "border-transparent"
                    } px-6 py-4 border`}
                  >
                    <NonThemedView className="-rotate-12">
                      <Necromancer
                        height={120}
                        width={110}
                        style={{ marginBottom: 5 }}
                        color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                      />
                    </NonThemedView>
                    <Text
                      className="mx-auto text-xl"
                      style={{ color: "#9333ea" }}
                    >
                      Necromancer
                    </Text>
                  </NonThemedView>
                )}
              </Pressable>
              <Pressable
                className="-mr-2"
                onPress={() => {
                  setSelectedClass("paladin");
                  classRef.current = "paladin";
                }}
              >
                {({ pressed }) => (
                  <NonThemedView
                    className={`${
                      pressed || selectedClass == "paladin"
                        ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                        : "border-transparent"
                    } px-8 py-4 border`}
                  >
                    <NonThemedView className="rotate-12">
                      <NonThemedView className="scale-x-[-1] transform">
                        <PaladinHammer
                          height={120}
                          width={90}
                          style={{ marginBottom: 5 }}
                        />
                      </NonThemedView>
                    </NonThemedView>
                    <Text
                      className="mx-auto text-xl"
                      style={{ color: "#fcd34d" }}
                    >
                      Paladin
                    </Text>
                  </NonThemedView>
                )}
              </Pressable>
            </NonThemedView>
            {selectedClass == "paladin" ? (
              <Text className="mt-6 h-16 text-center">
                The Paladin is skilled with arms and uses holy magic, which is
                especially powerful against the undead.
              </Text>
            ) : selectedClass == "necromancer" ? (
              <Text className="mt-6 h-16 text-center">
                The Necromancer can summon minions, use blood, bone and
                poisonous magics.
              </Text>
            ) : null}
            {selectedClass && (
              <NonThemedView className="mx-auto mt-4">
                <Pressable
                  onPress={() =>
                    router.push(`/NewGame/SetSex/${classRef.current}`)
                  }
                  className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text className="text-xl tracking-widest">Next</Text>
                </Pressable>
              </NonThemedView>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
