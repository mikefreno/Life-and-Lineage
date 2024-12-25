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
import { useNewGameStore } from "./_layout";
import { useRootStore } from "../../hooks/stores";
import { FadeSlide } from "../../components/AnimatedWrappers";
import GenericFlatLink from "../../components/GenericLink";

export default function SetName() {
  const { uiStore } = useRootStore();
  const { classSelection } = useNewGameStore();
  if (!classSelection) {
    router.back();
    router.back();
    router.back();
    return;
  }

  const header = useHeaderHeight();
  const { firstName, lastName, setFirstName, setLastName } = useNewGameStore();

  const { colorScheme } = useColorScheme();

  function trimWhitespace(str: string) {
    return str.trim().replace(/\s+/g, " ");
  }

  return (
    <>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessibilityRole="none"
      >
        <View className="flex-1">
          <KeyboardAvoidingView style={{ marginTop: -header, flex: 1 }}>
            <View className="flex-1 px-6 pb-16 items-center justify-center border">
              <View
                className="flex flex-row text-center"
                accessibilityRole="header"
              >
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
                onBlur={() => {
                  setFirstName(trimWhitespace(firstName));
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
                  width: Math.min(uiStore.dimensions.width * 0.65, 300),
                  fontSize: 20,
                }}
                accessibilityHint="Enter Your Character's First Name"
                accessibilityLabel="First Name"
              />
              <Text className="pl-1 pt-1 pb-2">Maximum Length: 16</Text>
              <TextInput
                className="rounded border border-zinc-800 pl-2 text-black dark:border-zinc-100 dark:text-zinc-50"
                onChangeText={(text) => {
                  setLastName(text.replace(/^\s+/, ""));
                }}
                onBlur={() => {
                  setLastName(trimWhitespace(lastName));
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
                  width: Math.min(uiStore.dimensions.width * 0.65, 300),
                  fontSize: 20,
                }}
                accessibilityHint="Enter Your Character's Last Name"
                accessibilityLabel="Last Name"
              />
              <Text className="pl-1 pt-1 pb-2">Maximum Length: 16</Text>
              <View>
                <View className="mx-auto">
                  <FadeSlide
                    show={
                      firstName.trimEnd().length > 0 &&
                      lastName.trimEnd().length > 0
                    }
                  >
                    {({ showing }) => (
                      <GenericFlatLink
                        disabled={!showing}
                        href="./Review"
                        accessibilityRole="link"
                        accessibilityLabel="Next"
                      >
                        <Text>Next</Text>
                      </GenericFlatLink>
                    )}
                  </FadeSlide>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}
