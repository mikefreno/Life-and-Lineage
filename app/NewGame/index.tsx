import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, useColorScheme } from "react-native";
import { Text, View, SafeAreaView, ScrollView } from "../../components/Themed";
import "../../assets/styles/globals.css";
import { useContext, useState } from "react";
import WitchHat from "../../assets/icons/WitchHatIcon";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { Stack, router } from "expo-router";
import { GameContext, PlayerCharacterContext } from "../_layout";

export default function NewGameScreen() {
  const [witchOrWizard, setWitchOrWizard] = useState<string>("");
  const colorScheme = useColorScheme();

  const playerContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);

  if (!gameContext || !playerContext) {
    throw new Error("NewGameScreen must be used within a GameContext provider");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Witch Or Wizard?",
          headerShown: playerContext.playerCharacter ? true : false,
        }}
      />
      <SafeAreaView>
        <ScrollView className="h-full">
          <Text className="bold pt-16 text-center text-3xl">
            Create a Character
          </Text>
          <View className="">
            <View className="mx-auto my-8 w-4/5">
              <Text className="pt-12 text-center text-2xl">
                Witch Or Wizard?
              </Text>
              <View className="flex flex-row justify-between pt-12">
                <Pressable
                  onPress={() => {
                    setWitchOrWizard("Witch");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || witchOrWizard == "Witch"
                          ? "scale-110 rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-950"
                          : null
                      } px-2 py-4`}
                    >
                      <View className="mr-6 -rotate-12">
                        <WitchHat
                          height={120}
                          width={120}
                          color={colorScheme == "dark" ? "#7c3aed" : "#4c1d95"}
                        />
                      </View>
                      <Text className="mx-auto text-xl">Witch</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => {
                    setWitchOrWizard("Wizard");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || witchOrWizard == "Wizard"
                          ? "scale-110 rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                          : null
                      } px-2 py-4`}
                    >
                      <View className="ml-6 rotate-12">
                        <View className="scale-x-[-1] transform">
                          <WizardHat
                            height={114}
                            width={120}
                            style={{ marginBottom: 5 }}
                            color={
                              colorScheme == "dark" ? "#2563eb" : "#1e40af"
                            }
                          />
                        </View>
                      </View>
                      <Text className="mx-auto text-xl">Wizard</Text>
                    </View>
                  )}
                </Pressable>
              </View>
              {witchOrWizard !== "" ? (
                <View className="mx-auto mt-24">
                  <Pressable
                    onPress={() =>
                      router.push(`/NewGame/SetName/${witchOrWizard}`)
                    }
                  >
                    {({ pressed }) => (
                      <View
                        className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
                          pressed ? "scale-95 opacity-30" : null
                        }`}
                      >
                        <Text style={{ color: "white" }} className="text-2xl">
                          Next
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
