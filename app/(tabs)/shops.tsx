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
import Modal from "react-native-modal/dist/modal";
import { Entypo } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function ShopsScreen() {
  const gameData = useContext(GameContext);
  if (!gameData) throw new Error("missing gameData");
  const { gameState } = gameData;
  const vibration = useVibration();
  const { colorScheme } = useColorScheme();

  const [showShopTutorial, setShowShopTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("shops")) ?? false,
  );

  const [tutorialStep, setTutorialStep] = useState<number>(1);

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
        <Modal
          animationIn="slideInUp"
          animationOut="fadeOut"
          isVisible={showShopTutorial && gameState?.tutorialsEnabled}
          backdropOpacity={0.2}
          animationInTiming={500}
          onBackdropPress={() => setShowShopTutorial(false)}
          onBackButtonPress={() => setShowShopTutorial(false)}
        >
          <View
            className="mx-auto w-5/6 rounded-xl bg-zinc-50 px-6 py-4 dark:bg-zinc-700"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },

              shadowOpacity: 0.25,
              shadowRadius: 5,
            }}
          >
            <View
              className={`flex flex-row ${
                tutorialStep == 2 ? "justify-between" : "justify-end"
              }`}
            >
              {tutorialStep == 2 ? (
                <Pressable onPress={() => setTutorialStep((prev) => prev - 1)}>
                  <Entypo
                    name="chevron-left"
                    size={24}
                    color={colorScheme == "dark" ? "#f4f4f5" : "black"}
                  />
                </Pressable>
              ) : null}
              <Text>{tutorialStep}/2</Text>
            </View>
            {tutorialStep == 1 ? (
              <>
                <Text className="text-center text-2xl">Shop Tab</Text>
                <Text className="my-4 text-center text-lg">
                  Each of these shops buy and sell various types of items.
                </Text>
                <Pressable
                  onPress={() => setTutorialStep((prev) => prev + 1)}
                  className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Next</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="text-center text-xl">
                  Stock Refresh Schedule
                </Text>
                <Text className="my-4 text-center">
                  Each shop refreshes its stock and gold supply every real world
                  hour.
                </Text>
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    setShowShopTutorial(false);
                  }}
                  className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </Modal>
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
