import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { View as ThemedView, Text } from "../../../components/Themed";
import { useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";

export default function SetName() {
  const { slug } = useLocalSearchParams();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Name",
        }}
      />
      <ThemedView className="flex-1 px-6">
        <Text className="py-12 text-center text-2xl text-zinc-900 dark:text-zinc-50">
          {`Choose Your ${slug}'s Name`}
        </Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TextInput
            className="mt-12 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
            placeholderClassName="text-zinc-400 dark:text-zinc-400"
            onChangeText={(text) => setFirstName(text.replace(/^\s+/, ""))}
            placeholder={"Given Name (First Name)"}
            value={firstName}
            maxLength={16}
            style={{
              paddingVertical: 8,
            }}
          />
          <Text className="pl-1 pt-1 italic">
            Minimum Length: 2, Maximum Length: 16
          </Text>
          <TextInput
            className="mt-12 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
            placeholderClassName="text-zinc-400 dark:text-zinc-400"
            onChangeText={(text) => setLastName(text.replace(/^\s+/, ""))}
            placeholder={"Surname (Last Name)"}
            value={lastName}
            maxLength={16}
            style={{ paddingVertical: 8 }}
          />
          <Text className="pl-1 pt-1 italic">
            Minimum Length: 3, Maximum Length: 16
          </Text>
        </KeyboardAvoidingView>
        {firstName.trimEnd().length >= 2 && lastName.trimEnd().length >= 3 ? (
          <View className="mx-auto mt-24">
            <Pressable
              onPress={() =>
                router.push(
                  `/NewGame/SetStars/${slug}/${firstName.trimEnd()}/${lastName.trimEnd()}`,
                )
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
      </ThemedView>
    </>
  );
}
