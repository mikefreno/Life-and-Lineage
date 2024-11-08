import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { View as ThemedView, Text } from "../../../components/Themed";
import { useContext, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { toTitleCase } from "../../../utility/functions/misc";
import { useVibration } from "../../../utility/customHooks";
import { useColorScheme } from "nativewind";
import { useHeaderHeight } from "@react-navigation/elements";
import { AppContext } from "../../_layout";
import {
  PlayerClassOptions,
  isPlayerClassOptions,
} from "../../../utility/types";
import { playerClassColors } from "../../../constants/Colors";
import GenericFlatButton from "../../../components/GenericFlatButton";

export default function SetName() {
  const appData = useContext(AppContext);
  if (!appData) return;
  const { dimensions } = appData;
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return router.replace("/NewGame");
  }
  let playerClass: PlayerClassOptions;

  if (isPlayerClassOptions(slug[0])) {
    playerClass = slug[0];
  } else {
    return <Text>{`Invalid player class option: ${slug[0]}`}</Text>;
  }
  const blessing = slug[1];
  const sex = slug[2];
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const firstNameRef = useRef<string>();
  const lastNameRef = useRef<string>();
  const header = useHeaderHeight();

  const vibration = useVibration();
  const { colorScheme } = useColorScheme();

  function trimWhitespace(str: string) {
    // Trim leading and trailing spaces, then replace multiple spaces with a single space
    return str.trim().replace(/\s+/g, " ");
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView className="flex-1">
          <KeyboardAvoidingView style={{ marginTop: -header, flex: 1 }}>
            <ThemedView className="flex-1 px-6 items-center justify-center border">
              <View className="flex flex-row text-center">
                <Text className="text-center text-2xl md:text-3xl">
                  Choose Your
                  <Text
                    className="text-center text-2xl md:text-3xl"
                    style={{ color: playerClassColors[playerClass] }}
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
              <Text className="pl-1 pt-1 pb-2">Maximum Length: 16</Text>
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
              <Text className="pl-1 pt-1 pb-2">Maximum Length: 16</Text>
              <View>
                {firstName.trimEnd() && lastName.trimEnd() ? (
                  <View className="mx-auto">
                    <GenericFlatButton
                      onPressFunction={() => {
                        vibration({ style: "light" });
                        router.push(
                          `/NewGame/Review/${playerClass}/${blessing}/${sex}/${trimWhitespace(
                            firstName,
                          )}/${trimWhitespace(lastName)}`,
                        );
                      }}
                    >
                      Next
                    </GenericFlatButton>
                  </View>
                ) : null}
              </View>
            </ThemedView>
          </KeyboardAvoidingView>
        </ThemedView>
      </TouchableWithoutFeedback>
    </>
  );
}
