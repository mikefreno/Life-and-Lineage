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
import { toTitleCase } from "../../../utility/functions";

export default function SetName() {
  const { slug } = useLocalSearchParams();
  const playerClass = slug[0];
  const sex = slug[1];
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Name Set",
        }}
      />
      <ThemedView className="flex-1 px-6">
        <Text className="py-12 text-center text-2xl text-zinc-900 dark:text-zinc-50">
          {`Choose Your ${toTitleCase(playerClass)}'s Name`}
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
            autoCorrect={false}
            autoCapitalize="words"
            autoComplete="given-name"
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
            autoComplete="family-name"
            autoCorrect={false}
            autoCapitalize="words"
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
                  `/NewGame/SetBlessing/${playerClass}/${sex}/${firstName.trimEnd()}/${lastName.trimEnd()}`,
                )
              }
              className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text className="text-xl tracking-widest">Next</Text>
            </Pressable>
          </View>
        ) : null}
      </ThemedView>
    </>
  );
}
