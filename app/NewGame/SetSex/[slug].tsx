import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../../components/Themed";
import { toTitleCase } from "../../../utility/functions";
import { Foundation } from "@expo/vector-icons";
import { Pressable, View as NonThemedView } from "react-native";
import { useState } from "react";

export default function SetSex() {
  const { slug } = useLocalSearchParams();
  const [sex, setSex] = useState<"male" | "female">();
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
              onPress={() => router.push(`/NewGame/SetName/${slug}/${sex}`)}
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
    </>
  );
}
