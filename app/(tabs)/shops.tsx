import { Pressable, FlatList, View as NonThemedView } from "react-native";
import { Text, View } from "../../components/Themed";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/selectors";
import { calculateAge, toTitleCase } from "../../utility/functions";
import { Shop } from "../../classes/shop";
import { CharacterImage } from "../../components/CharacterImage";
import shopObjects from "../../assets/json/shops.json";
import { router } from "expo-router";

export default function ShopsScreen() {
  const game = useSelector(selectGame);

  if (game) {
    const shops = game.getShops();

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
                shop.shopKeeperBirthDate,
                game.getGameDate(),
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
              onPress={() => router.push(`/Shops/${shop.archetype}`)}
            >
              <View
                className="rounded-lg px-8 py-3"
                style={{
                  shadowColor: shopObjects.find(
                    (shopObj) => shopObj.type == shop.archetype,
                  )?.colors.background,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
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
      <View className="flex-1">
        <FlatList
          data={shops}
          renderItem={renderItem}
          keyExtractor={(shop) => shop.archetype}
          numColumns={2}
        />
      </View>
    );
  }
}
