import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { View as ThemedView, Text } from "../../../components/Themed";
import { useContext, useRef, useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { toTitleCase } from "../../../utility/functions/misc/words";
import { useVibration } from "../../../utility/customHooks";
import { useColorScheme } from "nativewind";
import { useHeaderHeight } from "@react-navigation/elements";
import { AppContext } from "../../_layout";

export default function SetName() {
  const appData = useContext(AppContext);
  if (!appData) return;
  const { dimensions } = appData;
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  const playerClass = slug[0];
  const blessing = slug[1];
  const sex = slug[2];
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const firstNameRef = useRef<string>();
  const lastNameRef = useRef<string>();
  const header = useHeaderHeight();

  const vibration = useVibration();
  const { colorScheme } = useColorScheme();

  const accent =
    playerClass == "mage"
      ? "#2563eb"
      : playerClass == "necromancer"
      ? "#9333ea"
      : "#fcd34d";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Name Set",
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackTitleStyle: { fontFamily: "PixelifySans" },
        }}
      />
      <ThemedView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={header}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView className="flex-1 items-center px-6 justify-center">
              <View className="flex flex-row text-center">
                <Text className="text-center text-2xl md:text-3xl">
                  Choose Your
                  <Text
                    className="text-center text-2xl md:text-3xl"
                    style={{ color: accent }}
                  >
                    {" "}
                    {toTitleCase(playerClass)}'s{" "}
                  </Text>
                  Name
                </Text>
              </View>
              <TextInput
                className="rounded border border-zinc-800 pl-2 text-black dark:border-zinc-100 dark:text-zinc-50"
                placeholderTextColor={
                  colorScheme == "light" ? "#d4d4d8" : "#71717a"
                }
                onChangeText={(text) => {
                  setFirstName(text.replace(/^\s+/, ""));
                  firstNameRef.current = text.replace(/^\s+/, "");
                }}
                placeholder={"Given Name (First Name)"}
                value={firstName}
                autoCorrect={false}
                autoCapitalize="words"
                autoComplete="given-name"
                maxLength={16}
                style={{
                  fontFamily: "PixelifySans",
                  paddingVertical: 8,
                  width: Math.min(dimensions.width * 0.65, 300),
                  fontSize: 20,
                }}
              />
              <Text className="pl-1 pt-1 pb-2">
                Minimum Length: 2, Maximum Length: 16
              </Text>
              <TextInput
                className="rounded border border-zinc-800 pl-2 text-black dark:border-zinc-100 dark:text-zinc-50"
                onChangeText={(text) => {
                  setLastName(text.replace(/^\s+/, ""));
                  lastNameRef.current = text.replace(/^\s+/, "");
                }}
                placeholderTextColor={
                  colorScheme == "light" ? "#d4d4d8" : "#71717a"
                }
                placeholder={"Surname (Last Name)"}
                autoComplete="family-name"
                autoCorrect={false}
                autoCapitalize="words"
                value={lastName}
                maxLength={16}
                style={{
                  fontFamily: "PixelifySans",
                  paddingVertical: 8,
                  width: Math.min(dimensions.width * 0.65, 300),
                  fontSize: 20,
                }}
              />
              <Text className="pl-1 pt-1 pb-2">
                Minimum Length: 3, Maximum Length: 16
              </Text>
              <View className="pb-16">
                {firstName.trimEnd().length >= 2 &&
                lastName.trimEnd().length >= 3 ? (
                  <View className="mx-auto">
                    <Pressable
                      onPress={() => {
                        vibration({ style: "light" });
                        router.push(
                          `/NewGame/Review/${playerClass}/${blessing}/${sex}/${firstNameRef.current?.trimEnd()}/${lastNameRef.current?.trimEnd()}`,
                        );
                      }}
                      className="mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                    >
                      <Text className="text-xl tracking-widest">Next</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </ThemedView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}
