import GenericRaisedButton from "@/components/GenericRaisedButton";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { Text } from "@/components/Themed";
import ThemedCard from "@/components/ThemedCard";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { jsonServiceStore } from "@/stores/SingletonSource";
import { toTitleCase, wait } from "@/utility/functions/misc";
import { PvPRewardIcons } from "@/utility/pvp";
import { FontAwesome5 } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import React from "react";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { API_BASE_URL } from "@/config/config";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { isEmulatorSync } from "react-native-device-info";
import { fetch } from "expo/fetch";
import { useRouter } from "expo-router";
import PagedContentModal from "@/components/PagedContentModal";
import Colors from "@/constants/Colors";
import BlessingDisplay from "@/components/BlessingsDisplay";

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!isEmulatorSync()) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {}
  }
}

const PVPArena = observer(() => {
  const { uiStore, pvpStore } = useRootStore();
  const styles = useStyles();
  const [showPvPInfoModal, setShowPvPInfoModal] = useState<boolean>(false);
  const vibration = useVibration();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [sentToken, setSentToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    wait(500).then(() => {
      registerForPushNotificationsAsync()
        .then((token) => setExpoPushToken(token ?? ""))
        .catch((error: any) => setExpoPushToken(`${error}`));
    });
  }, []);

  useEffect(() => {
    if (expoPushToken && !sentToken) {
      fetch(`${API_BASE_URL}/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: expoPushToken }),
      });
      setSentToken(true);
      pvpStore.setExpoPushToken(expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    const retrieveData = async () => {
      await Promise.all([
        pvpStore.sendPlayerToAPI(),
        pvpStore.retrieveOpponents(),
      ]).catch((e) => {
        __DEV__ && console.error(e);
        //TODO: Add ui notification
        router.back();
      });
    };
    retrieveData();
  }, []);

  return (
    <>
      <PagedContentModal
        pages={[
          {
            title: "What is this?",
            body: "Here you can engage with fights against the ghosts of other players.",
          },
          {
            title: "Fight to the (near) death",
            body: "You will not die here, but you might get very close...",
          },
          {
            title: "Earn Blood Tokens",
            body: "Defeat player and earn Blood Tokens. Players with greater win/loss ratios give greater rewards.",
          },
          {
            title: "Get rewarding rewards",
            body: "Spend Blood Tokens on valuable rewards. You can earn the ability to redistribute your attribute points and even a potion to reduce your character's age!",
          },
        ]}
        isVisible={showPvPInfoModal}
        handleClose={() => setShowPvPInfoModal(false)}
      />
      <View
        style={{
          flex: 1,
          paddingBottom: uiStore.playerStatusHeightSecondary,
          paddingTop: uiStore.headerHeight,
        }}
      >
        <View style={{ flex: 1 }}>
          <GenericStrikeAround>Available Battles</GenericStrikeAround>
          <Pressable
            style={{ marginLeft: 4 }}
            onPress={() => {
              vibration({ style: "light" });
              setShowPvPInfoModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Show PvP Info"
          >
            <FontAwesome5
              name="question-circle"
              size={uiStore.dimensions.greater / 24}
              color={uiStore.isDark ? "#fafafa" : "#27272a"}
            />
          </Pressable>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              ...styles.notchMirroredLanscapePad,
            }}
          >
            {pvpStore.availableOpponents.map((opp, index) => (
              <ThemedCard
                key={`${opp.name}-${index}`}
                cardStyle={{
                  height: "100%",
                  justifyContent: "space-between",
                  width: uiStore.dimensions.lesser / 2,
                  marginHorizontal: 8,
                }}
              >
                <View>
                  <View>
                    <Text style={[styles.textCenter, styles["text-xl"]]}>
                      {opp.name}
                    </Text>
                    <Text style={[styles.textCenter]}>
                      {toTitleCase(opp.playerClass)}
                    </Text>
                  </View>
                  <View style={{ marginHorizontal: "auto", marginVertical: 4 }}>
                    <BlessingDisplay
                      blessing={opp.blessing}
                      colorScheme={uiStore.colorScheme}
                    />
                  </View>
                  <Text>
                    Wins: {opp.winCount} | Losses: {opp.lossCount}
                  </Text>
                  <Text>Reward For Winning: {opp.rewardValue}</Text>
                  <GenericRaisedButton
                    backgroundColor={Colors[uiStore.colorScheme].error}
                  >
                    FIGHT!
                  </GenericRaisedButton>
                </View>
              </ThemedCard>
            ))}
          </ScrollView>
        </View>
        <View style={{ flex: 1 }}>
          <GenericStrikeAround>Rewards Option</GenericStrikeAround>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              ...styles.notchMirroredLanscapePad,
            }}
          >
            {jsonServiceStore
              .readJsonFileSync("pvpRewards")
              .map((pvpReward) => (
                <ThemedCard
                  key={pvpReward.id}
                  cardStyle={{
                    height: "100%",
                    justifyContent: "space-between",
                    width: uiStore.dimensions.lesser / 2,
                    marginHorizontal: 8,
                  }}
                >
                  <Text
                    style={[
                      styles["text-xl"],
                      {
                        textAlign: "center",
                        textDecorationLine: "underline",
                      },
                    ]}
                  >
                    {toTitleCase(pvpReward.name)}
                  </Text>
                  <View style={{ marginHorizontal: "auto" }}>
                    <PvPRewardIcons
                      icon={pvpReward.icon}
                      size={uiStore.dimensions.lesser * 0.3}
                      colorScheme={uiStore.colorScheme}
                    />
                  </View>
                  <Text style={{ textAlign: "center" }}>
                    {pvpReward.description}
                  </Text>
                  <View>
                    <Text style={[styles["text-2xl"], { textAlign: "center" }]}>
                      Cost: {pvpReward.price}
                    </Text>
                    <GenericRaisedButton>Purchase</GenericRaisedButton>
                  </View>
                </ThemedCard>
              ))}
          </ScrollView>
        </View>
        <PlayerStatusForSecondary />
      </View>
    </>
  );
});
export default PVPArena;
