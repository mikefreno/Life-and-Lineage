import GenericModal from "@/components/GenericModal";
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
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { API_BASE_URL } from "@/config/config";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { isEmulatorSync } from "react-native-device-info";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
  const [_, setNotification] = useState<Notifications.Notification | undefined>(
    undefined,
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    const notificationFlow = () => {
      wait(500).then(() => {
        registerForPushNotificationsAsync()
          .then((token) => setExpoPushToken(token ?? ""))
          .catch((error: any) => setExpoPushToken(`${error}`));

        notificationListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
          });

        responseListener.current =
          Notifications.addNotificationResponseReceivedListener(
            (response) => {},
          );

        return () => {
          notificationListener.current &&
            Notifications.removeNotificationSubscription(
              notificationListener.current,
            );
          responseListener.current &&
            Notifications.removeNotificationSubscription(
              responseListener.current,
            );
        };
      });
    };
    notificationFlow();
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
    pvpStore.sendPlayerToAPI();
  }, []);

  return (
    <>
      <GenericModal
        isVisibleCondition={showPvPInfoModal}
        backFunction={() => setShowPvPInfoModal(false)}
      >
        <View></View>
      </GenericModal>
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
              <ThemedCard key={`${opp.name}-${index}`}></ThemedCard>
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
