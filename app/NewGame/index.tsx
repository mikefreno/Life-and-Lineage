import { Pressable, useColorScheme } from "react-native";
import { Text, View, SafeAreaView } from "../../components/Themed";
import { View as NonThemedView } from "react-native";
import "../../assets/styles/globals.css";
import { useState } from "react";
import WitchHat from "../../assets/icons/WitchHatIcon";
import WizardHat from "../../assets/icons/WizardHatIcon";
import { Stack, router } from "expo-router";
import { useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";

export default function NewGameScreen() {
  const [witchOrWizard, setWitchOrWizard] = useState<string>("");
  const colorScheme = useColorScheme();

  const playerCharacter = useSelector(selectPlayerCharacter);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Witch Or Wizard?",
          headerShown: playerCharacter ? true : false,
        }}
      />
      <SafeAreaView>
        <View className="h-full">
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
                    <NonThemedView
                      className={`${
                        pressed || witchOrWizard == "Witch"
                          ? "scale-110 rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                          : null
                      } px-2 py-4`}
                    >
                      <NonThemedView className="mr-6 -rotate-12">
                        <WitchHat
                          height={120}
                          width={120}
                          color={colorScheme == "dark" ? "#7c3aed" : "#4c1d95"}
                        />
                      </NonThemedView>
                      <Text className="mx-auto text-xl">Witch</Text>
                    </NonThemedView>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => {
                    setWitchOrWizard("Wizard");
                  }}
                >
                  {({ pressed }) => (
                    <NonThemedView
                      className={`${
                        pressed || witchOrWizard == "Wizard"
                          ? "scale-110 rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                          : null
                      } px-2 py-4`}
                    >
                      <NonThemedView className="ml-6 rotate-12">
                        <NonThemedView className="scale-x-[-1] transform">
                          <WizardHat
                            height={114}
                            width={120}
                            style={{ marginBottom: 5 }}
                            color={
                              colorScheme == "dark" ? "#2563eb" : "#1e40af"
                            }
                          />
                        </NonThemedView>
                      </NonThemedView>
                      <Text className="mx-auto text-xl">Wizard</Text>
                    </NonThemedView>
                  )}
                </Pressable>
              </View>
              {witchOrWizard !== "" ? (
                <NonThemedView className="mx-auto mt-24">
                  <Pressable
                    onPress={() =>
                      router.push(`/NewGame/SetName/${witchOrWizard}`)
                    }
                  >
                    {({ pressed }) => (
                      <NonThemedView
                        className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
                          pressed ? "scale-95 opacity-30" : null
                        }`}
                      >
                        <Text style={{ color: "white" }} className="text-2xl">
                          Next
                        </Text>
                      </NonThemedView>
                    )}
                  </Pressable>
                </NonThemedView>
              ) : null}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
