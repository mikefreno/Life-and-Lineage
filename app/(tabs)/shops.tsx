import { Pressable, FlatList, View as NonThemedView } from "react-native";
import { Text, View } from "../../components/Themed";
import { calculateAge, toTitleCase } from "../../utility/functions";
import { Shop } from "../../classes/shop";
import { CharacterImage } from "../../components/CharacterImage";
import shopObjects from "../../assets/json/shops.json";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";

export default function ShopsScreen() {
  const gameData = useContext(GameContext);
  if (!gameData) throw new Error("missing gameData");
  const { gameState } = gameData;
  const vibration = useVibration();
  const [showShopTutorial, setShowShopTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("shops")) ?? false,
  );
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!showShopTutorial && gameState) {
      gameState.updateTutorialState("shops", true);
    }
  }, [showShopTutorial]);

  if (gameState) {
    const shops = gameState.shops;

    const renderItem = ({ item: shop }: { item: Shop }) => (
      <NonThemedView className="w-1/2">
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
                new Date(shop.shopKeeperBirthDate),
                new Date(gameState.date),
              )}
              characterSex={shop.shopKeeperSex == "male" ? "M" : "F"}
            />
            <Text
              className="text-center"
              style={{
                color: shopObjects.find(
                  (shopObj) => shopObj.type == shop.archetype,
                )?.colors.font,
              }}
            >
              {shop.shopKeeperName}
            </Text>

            <Pressable
              className="mt-2 active:scale-95 active:opacity-50"
              onPress={() => {
                vibration({ style: "light" });
                router.push(`/Shops/${shop.archetype}`);
              }}
            >
              <View
                className="rounded-lg px-8 py-3"
                style={{
                  shadowColor: shopObjects.find(
                    (shopObj) => shopObj.type == shop.archetype,
                  )?.colors.background,
                  elevation: 1,
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
            body: "Each shop refreshes its stock and gold supply every real hour.",
          }}
          onCloseFunction={() => setShowShopTutorial(false)}
        />
        <View className="flex-1">
          <FlatList
            data={shops}
            renderItem={renderItem}
            keyExtractor={(shop) => shop.archetype}
            numColumns={2}
          />
        </View>
      </>
    );
  }
}
