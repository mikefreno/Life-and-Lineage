import { Pressable, View as NonThemedView } from "react-native";
import { ScrollView, Text, View } from "../../components/Themed";
import { Shop } from "../../classes/shop";
import { CharacterImage } from "../../components/CharacterImage";
import shopObjects from "../../assets/json/shops.json";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerStatusCompactContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import PlayerStatus from "../../components/PlayerStatus";
import { useHeaderHeight } from "@react-navigation/elements";
import { toTitleCase } from "../../utility/functions/misc/words";
import { calculateAge } from "../../utility/functions/misc/age";

export default function ShopsScreen() {
  const gameData = useContext(GameContext);
  const playerStatusCompact = useContext(PlayerStatusCompactContext);
  if (!gameData || !playerStatusCompact) throw new Error("missing gameData");

  const vibration = useVibration();
  const isFocused = useIsFocused();

  const { gameState } = gameData;
  const { isCompact } = playerStatusCompact;
  const [showShopTutorial, setShowShopTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("shops")) ?? false,
  );

  useEffect(() => {
    if (!showShopTutorial && gameState) {
      gameState.updateTutorialState("shops", true);
    }
  }, [showShopTutorial]);

  if (gameState) {
    const renderItem = (shop: Shop) => (
      <NonThemedView className="h-96 w-1/2" key={shop.shopKeeper.id}>
        <NonThemedView
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
            shadowOpacity: 0.2,
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
          <NonThemedView className="items-center">
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
              {shop.shopKeeper.getFullName()}
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
          </NonThemedView>
        </NonThemedView>
      </NonThemedView>
    );

    return (
      <>
        <TutorialModal
          isVisibleCondition={
            (showShopTutorial && gameState?.tutorialsEnabled && isFocused) ??
            false
          }
          backFunction={() => setShowShopTutorial(false)}
          pageOne={{
            title: "Shop Tab",
            body: "Each of these shops buy and sell various types of items.",
          }}
          pageTwo={{
            title: "Stock Refresh Schedule",
            body: "Each shop refreshes its stock and gold supply every real world hour.",
          }}
          onCloseFunction={() => setShowShopTutorial(false)}
        />
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              paddingBottom: useBottomTabBarHeight() + (isCompact ? 40 : 84),
              paddingTop: useHeaderHeight(),
            }}
          >
            {gameState.shops.map((shop) => renderItem(shop))}
          </View>
        </ScrollView>
        <NonThemedView
          className="absolute z-50 w-full"
          style={{ bottom: useBottomTabBarHeight() + 75 }}
        >
          <PlayerStatus hidden hideGold />
        </NonThemedView>
      </>
    );
  }
}
