import {
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "../../components/Themed";
import { router } from "expo-router";
import { toTitleCase } from "../../utility/functions/misc";
import { useColorScheme } from "nativewind";
import { useHeaderHeight } from "@react-navigation/elements";
import { playerClassColors } from "../../constants/Colors";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useVibration } from "../../hooks/generic";
import { useUIStore } from "../../hooks/stores";
import { useNewGameStore } from "./_layout";

export default function SetName() {
  const { dimensions } = useUIStore();
  const { classSelection } = useNewGameStore();
  if (!classSelection) {
    router.back();
    router.back();
    router.back();
    return;
  }

  const header = useHeaderHeight();
  const { firstName, lastName, setFirstName, setLastName } = useNewGameStore();

  const vibration = useVibration();
  const { colorScheme } = useColorScheme();

  function trimWhitespace(str: string) {
    return str.trim().replace(/\s+/g, " ");
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <KeyboardAvoidingView style={{ marginTop: -header, flex: 1 }}>
            <View className="flex-1 px-6 items-center justify-center border">
              <View className="flex flex-row text-center">
                <Text className="text-center text-2xl md:text-3xl">
                  Choose Your
                  <Text
                    className="text-center text-2xl md:text-3xl"
                    style={{ color: playerClassColors[classSelection] }}
                  >
                    {" "}
                    {toTitleCase(classSelection)}'s{" "}
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
                  width: Math.min(dimensions.window.width * 0.65, 300),
                  fontSize: 20,
                }}
              />
              <Text className="pl-1 pt-1 pb-2">Maximum Length: 16</Text>
              <TextInput
                className="rounded border border-zinc-800 pl-2 text-black dark:border-zinc-100 dark:text-zinc-50"
                onChangeText={(text) => {
                  setLastName(text.replace(/^\s+/, ""));
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
                  width: Math.min(dimensions.window.width * 0.65, 300),
                  fontSize: 20,
                }}
              />
              <Text className="pl-1 pt-1 pb-2">Maximum Length: 16</Text>
              <View>
                {firstName.trimEnd().length > 0 &&
                lastName.trimEnd().length > 0 ? (
                  <View className="mx-auto">
                    <GenericFlatButton
                      onPress={() => {
                        vibration({ style: "light" });
                        setFirstName(trimWhitespace(firstName));
                        setLastName(trimWhitespace(lastName));
                        router.push(`/Review`);
                      }}
                    >
                      Next
                    </GenericFlatButton>
                  </View>
                ) : null}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}
