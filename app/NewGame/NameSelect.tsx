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
import { useHeaderHeight } from "@react-navigation/elements";
import { playerClassColors } from "../../constants/Colors";
import { useNewGameStore } from "./_layout";
import { useRootStore } from "../../hooks/stores";
import { FadeSlide } from "../../components/AnimatedWrappers";
import { text, tw_base, useStyles } from "../../hooks/styles";
import GenericFlatButton from "../../components/GenericFlatButton";

export default function SetName() {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const isDark = uiStore.colorScheme === "dark";
  const { classSelection, firstName, lastName, setFirstName, setLastName } =
    useNewGameStore();
  const header = useHeaderHeight();

  if (!classSelection) {
    router.back();
    router.back();
    router.back();
    return;
  }

  function trimWhitespace(str: string) {
    return str.trim().replace(/\s+/g, " ");
  }

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessibilityRole="none"
    >
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ marginTop: -header, flex: 1 }}>
          <View style={styles.nameContainer}>
            <View style={{ flexDirection: "row" }} accessibilityRole="header">
              <Text
                style={{
                  textAlign: "center",
                  ...text["2xl"],
                  paddingBottom: tw_base[2],
                }}
              >
                Choose Your
                <Text
                  style={{
                    ...text["2xl"],
                    textAlign: "center",
                    color: playerClassColors[classSelection],
                  }}
                >
                  {" "}
                  {toTitleCase(classSelection)}'s{" "}
                </Text>
                Name
              </Text>
            </View>
            <TextInput
              style={[
                styles.nameInput,
                {
                  borderColor: isDark ? "#fafafa" : "#27272a",
                  color: isDark ? "#fafafa" : "#09090b",
                  width: Math.min(uiStore.dimensions.width * 0.65, 300),
                },
              ]}
              placeholderTextColor={isDark ? "#71717a" : "#d4d4d8"}
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
              accessibilityHint="Enter Your Character's First Name"
              accessibilityLabel="First Name"
            />
            <Text style={{ paddingLeft: 4, paddingTop: 4, paddingBottom: 8 }}>
              Maximum Length: 16
            </Text>
            <TextInput
              style={[
                styles.nameInput,
                {
                  borderColor: isDark ? "#fafafa" : "#27272a",
                  color: isDark ? "#fafafa" : "#09090b",
                  width: Math.min(uiStore.dimensions.width * 0.65, 300),
                },
              ]}
              onChangeText={(text) => {
                setLastName(text.replace(/^\s+/, ""));
              }}
              onBlur={() => {
                setLastName(trimWhitespace(lastName));
              }}
              placeholderTextColor={isDark ? "#71717a" : "#d4d4d8"}
              placeholder={"Surname (Last Name)"}
              autoComplete="family-name"
              autoCorrect={false}
              autoCapitalize="words"
              value={lastName}
              maxLength={16}
              accessibilityHint="Enter Your Character's Last Name"
              accessibilityLabel="Last Name"
            />
            <Text style={{ paddingLeft: 4, paddingTop: 4, paddingBottom: 8 }}>
              Maximum Length: 16
            </Text>
            <View>
              <View style={{ marginHorizontal: "auto" }}>
                <FadeSlide
                  show={
                    firstName.trimEnd().length > 0 &&
                    lastName.trimEnd().length > 0
                  }
                >
                  {({ showing }) => (
                    <GenericFlatButton
                      disabled={!showing}
                      onPress={() => router.push("/NewGame/Review")}
                      accessibilityRole="link"
                      accessibilityLabel="Next"
                    >
                      <Text>Next</Text>
                    </GenericFlatButton>
                  )}
                </FadeSlide>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
