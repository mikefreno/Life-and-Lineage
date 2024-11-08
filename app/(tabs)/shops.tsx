import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../../components/Themed";
import { Shop } from "../../classes/shop";
import { CharacterImage } from "../../components/CharacterImage";
import shopObjects from "../../assets/json/shops.json";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { useVibration } from "../../utility/customHooks";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { toTitleCase, calculateAge } from "../../utility/functions/misc";
import { AppContext } from "../_layout";
import { TutorialOption } from "../../utility/types";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import D20DieAnimation from "../../components/DieRollAnim";

const ShopsScreen = observer(() => {
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing gameData");
  const vibration = useVibration();
  const { gameState, isCompact } = appData;
  const [isReady, setIsReady] = useState(false);

  const runDeathChecks = () => {
    gameState?.shops.forEach((shop) => shop.deathCheck());
  };
  useEffect(() => {
    if (!isReady) {
      runDeathChecks();
      setIsReady(true);
    }
  }, []);
  const headerHeight = useHeaderHeight();
  const bottomHeight = useBottomTabBarHeight();

  if (gameState) {
    const renderItem = (shop: Shop) => (
      <View className="h-96 w-1/2" key={shop.shopKeeper.id}>
        <View
          className="m-2 flex-1 items-center justify-between rounded-xl border p-4"
          style={{
            shadowColor: shopObjects.find(
              (shopObj) => shopObj.type == shop.archetype,
            )?.colors.background,
            shadowOffset: {
              width: 2,
              height: 3,
            },
            elevation: 4,
            backgroundColor: shopObjects.find(
              (shopObj) => shopObj.type == shop.archetype,
            )?.colors.lightbackground,
            shadowOpacity: 0.5,
            shadowRadius: 4,
            borderColor: shopObjects.find(
              (shopObj) => shopObj.type == shop.archetype,
            )?.colors.background,
          }}
        >
          <Text
            className="text-center text-2xl"
            style={{
              color: shopObjects.find(
                (shopObj) => shopObj.type == shop.archetype,
              )?.colors.font,
            }}
          >
            The {toTitleCase(shop.archetype)}
          </Text>
          <View className="items-center">
            <CharacterImage
              characterAge={calculateAge(
                new Date(shop.shopKeeper.birthdate),
                new Date(gameState.date),
              )}
              characterSex={shop.shopKeeper.sex == "male" ? "M" : "F"}
            />
            <Text
              className="text-center"
              style={{
                color: shopObjects.find(
                  (shopObj) => shopObj.type == shop.archetype,
                )?.colors.font,
              }}
            >
              {shop.shopKeeper.fullName}
            </Text>

            <Pressable
              className="mt-2"
              onPress={() => {
                vibration({ style: "light" });
                router.push(`/Shops/${shop.archetype}`);
              }}
            >
              {({ pressed }) => (
                <View
                  className={`rounded-lg px-8 py-3 ${
                    pressed ? "scale-95 opacity-50" : ""
                  }`}
                  style={{
                    shadowColor: shopObjects.find(
                      (shopObj) => shopObj.type == shop.archetype,
                    )?.colors.background,
                    shadowOffset: {
                      width: 2,
                      height: 3,
                    },
                    elevation: 2,
                    backgroundColor: shopObjects.find(
                      (shopObj) => shopObj.type == shop.archetype,
                    )?.colors.background,
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                  }}
                >
                  <Text
                    className="text-lg"
                    style={{
                      color: shopObjects.find(
                        (shopObj) => shopObj.type == shop.archetype,
                      )?.colors.font,
                    }}
                  >
                    Enter
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );

    return (
      <>
        <TutorialModal
          tutorial={TutorialOption.shops}
          isFocused={useIsFocused()}
          pageOne={{
            title: "Shop Tab",
            body: "Each of these shops buy and sell various types of items.",
          }}
          pageTwo={{
            title: "Stock Refresh Schedule",
            body: "Each shop refreshes its stock and gold supply every real world hour.",
          }}
        />

        {isReady ? (
          <ScrollView
            scrollIndicatorInsets={{ top: 48, right: 0, left: 0, bottom: 48 }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingBottom: bottomHeight + (isCompact ? 0 : 28),
                paddingTop: headerHeight,
              }}
            >
              {gameState.shops.map((shop) => renderItem(shop))}
            </View>
          </ScrollView>
        ) : null}
      </>
    );
  }
});
export default ShopsScreen;
