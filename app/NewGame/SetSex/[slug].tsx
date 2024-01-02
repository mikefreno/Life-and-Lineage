import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../../components/Themed";
import { toTitleCase } from "../../../utility/functions";
import { Foundation } from "@expo/vector-icons";
import { Pressable, View as NonThemedView } from "react-native";
import { useRef, useState } from "react";
import { useVibration } from "../../../utility/customHooks";

export default function SetSex() {
  const { slug } = useLocalSearchParams();
  const [sex, setSex] = useState<"male" | "female">();

  let sexRef = useRef<"male" | "female">();
  const vibration = useVibration();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sex Select",
        }}
      />
      <View className="flex-1">
        <Text className="pt-8 text-center text-2xl">
          Set the sex of your {toTitleCase(slug as string)}
        </Text>
        <View className="mt-12 flex flex-row items-center justify-evenly">
          <Pressable
            onPress={() => {
              setSex("male");
              sexRef.current = "male";
            }}
          >
            {({ pressed }) => (
              <NonThemedView
                className={`${
                  pressed || sex == "male"
                    ? "scale-110 rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                    : null
                } px-6 py-4`}
              >
                <Foundation name="male-symbol" size={90} color="#3b82f6" />
                <Text className="text-center text-lg">Male</Text>
              </NonThemedView>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              setSex("female");
              sexRef.current = "female";
            }}
          >
            {({ pressed }) => (
              <NonThemedView
                className={`${
                  pressed || sex == "female"
                    ? "scale-110 rounded-lg border border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                    : null
                } px-6 py-4`}
              >
                <NonThemedView className="mx-auto">
                  <Foundation name="female-symbol" size={90} color="#f472b6" />
                </NonThemedView>
                <Text className="text-center text-lg">Female</Text>
              </NonThemedView>
            )}
          </Pressable>
        </View>
        {sex ? (
          <NonThemedView className="mx-auto mt-8">
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                router.push(`/NewGame/SetName/${slug}/${sexRef.current}`);
              }}
              className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text className="text-xl tracking-widest">Next</Text>
            </Pressable>
          </NonThemedView>
        ) : null}
      </View>
    </>
  );
}
