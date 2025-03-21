import {
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Platform,
  ScrollView,
} from "react-native";
import { Text } from "@/components/Themed";
import { useRouter } from "expo-router";
import { toTitleCase } from "@/utility/functions/misc";
import { playerClassColors } from "@/constants/Colors";
import { useNewGameStore } from "@/app/NewGame/_layout";
import { useRootStore } from "@/hooks/stores";
import { tw_base, useStyles } from "@/hooks/styles";
import GenericFlatButton from "@/components/GenericFlatButton";
import NewGameMetaControls from "@/components/NewGameMetaControls";
import { useVibration } from "@/hooks/generic";

export default function SetName() {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const isDark = uiStore.colorScheme === "dark";
  const { classSelection, firstName, lastName, setFirstName, setLastName } =
    useNewGameStore();

  const vibration = useVibration();
  const router = useRouter();

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessibilityRole="none"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            <View style={styles.nameContainer}>
              <View style={{ flexDirection: "row" }} accessibilityRole="header">
                <Text
                  style={{
                    textAlign: "center",
                    ...styles["text-2xl"],
                    paddingBottom: tw_base[2],
                  }}
                >
                  Choose Your
                  <Text
                    style={{
                      ...styles["text-2xl"],
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
                    width: uiStore.dimensions.width * 0.65,
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
              <Text
                style={[
                  styles["text-sm"],
                  { paddingLeft: 4, paddingTop: 4, paddingBottom: 8 },
                ]}
              >
                Maximum Length: 16
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    borderColor: isDark ? "#fafafa" : "#27272a",
                    color: isDark ? "#fafafa" : "#09090b",
                    width: uiStore.dimensions.width * 0.65,
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
              <Text
                style={[
                  styles["text-sm"],
                  { paddingLeft: 4, paddingTop: 4, paddingBottom: 8 },
                ]}
              >
                Maximum Length: 16
              </Text>
              <View>
                <GenericFlatButton
                  onPress={() => {
                    vibration({ style: "light" });
                    router.push("/NewGame/Review");
                  }}
                  accessibilityRole="link"
                  accessibilityLabel="Next"
                  disabled={
                    !(
                      firstName.trimEnd().length > 0 &&
                      lastName.trimEnd().length > 0
                    )
                  }
                  childrenWhenDisabled={"Set name to continue"}
                  style={{ marginTop: tw_base[3] }}
                >
                  Next
                </GenericFlatButton>
              </View>
            </View>
            <NewGameMetaControls />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
