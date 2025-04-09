import GenericRaisedButton from "@/components/GenericRaisedButton";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const PVPOptions = observer(() => {
  const styles = useStyles();
  const { uiStore, playerState } = useRootStore();
  const [pvpNameInput, setPvpNameInput] = useState("");
  const vibration = useVibration();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        ...styles.notchMirroredLanscapePad,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessibilityRole="none"
        >
          <View style={styles.settingsContainer}>
            <GenericStrikeAround style={{ textAlign: "center" }}>
              {`Set Display Name for PVP\n(defaults to character name)`}
            </GenericStrikeAround>
            <TextInput
              style={[
                styles.nameInput,
                {
                  borderColor:
                    uiStore.colorScheme == "dark" ? "#fafafa" : "#27272a",
                  color: uiStore.colorScheme == "dark" ? "#fafafa" : "#09090b",
                  width: uiStore.dimensions.width * 0.65,
                },
              ]}
              placeholderTextColor={Colors[uiStore.colorScheme].secondary}
              inputMode={"text"}
              maxLength={16}
              placeholder={"Desired name"}
              autoCorrect={false}
              autoCapitalize={"none"}
              value={pvpNameInput}
              onChangeText={setPvpNameInput}
            />
            <Text
              style={[
                styles["text-sm"],
                { paddingLeft: 4, paddingTop: 4, paddingBottom: 8 },
              ]}
            >
              Maximum Length: 16
            </Text>
            <Text
              style={[
                styles["text-sm"],
                { paddingLeft: 4, paddingTop: 4, paddingBottom: 8 },
              ]}
            >
              Currently: {pvpStore?.pvpName ?? playerState?.fullName}
            </Text>
            <GenericRaisedButton
              onPress={() =>
                runInAction(() => {
                  if (playerState) {
                    pvpStore.pvpName = pvpNameInput;
                  }
                })
              }
            >
              Set
            </GenericRaisedButton>
            <GenericStrikeAround style={{ textAlign: "center" }}>
              PvP notifications enabled
            </GenericStrikeAround>
            <Pressable
              style={styles.optionRow}
              onPress={() => {
                if (!pvpStore.notificationsEnabled) {
                  vibration({ style: "light" });
                  runInAction(() => (pvpStore.notificationsEnabled = true));
                }
              }}
            >
              <View
                style={[
                  styles.optionCircle,
                  pvpStore.notificationsEnabled && {
                    backgroundColor:
                      uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                  },
                ]}
              />
              <Text style={styles["text-2xl"]}>Enabled</Text>
            </Pressable>
            <Pressable
              style={styles.optionRow}
              onPress={() => {
                if (pvpStore.notificationsEnabled) {
                  vibration({ style: "light" });
                  runInAction(() => (pvpStore.notificationsEnabled = false));
                }
              }}
            >
              <View
                style={[
                  styles.optionCircle,
                  !pvpStore.notificationsEnabled && {
                    backgroundColor:
                      uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                  },
                ]}
              />
              <Text style={styles["text-2xl"]}>Disabled</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  );
});
export default PVPOptions;
