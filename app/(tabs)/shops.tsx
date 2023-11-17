import {
  Pressable,
  FlatList,
  View as NonThemedView,
  StyleSheet,
} from "react-native";
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
      <NonThemedView
        className="m-2 flex-1 items-center justify-between rounded-xl bg-slate-400 p-4"
        style={[
          styles.shadow,
          {
            backgroundColor: shopObjects.find(
              (shopObj) => shopObj.type == shop.archetype,
            )?.colors.lightbackground,
            shadowColor: shopObjects.find(
              (shopObj) => shopObj.type == shop.archetype,
            )?.colors.background,
          },
        ]}
      >
        <Text
          className="text-center text-2xl"
          style={{
            color: shopObjects.find((shopObj) => shopObj.type == shop.archetype)
              ?.colors.font,
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
            className="mt-2 rounded-lg px-8 py-3 active:scale-95 active:opacity-50"
            style={[
              styles.btnShadow,
              {
                backgroundColor: shopObjects.find(
                  (shopObj) => shopObj.type == shop.archetype,
                )?.colors.background,
                shadowColor: shopObjects.find(
                  (shopObj) => shopObj.type == shop.archetype,
                )?.colors.background,
              },
            ]}
            onPress={() => router.push(`/Shops/${shop.archetype}`)}
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
          </Pressable>
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
const styles = StyleSheet.create({
  shadow: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
  btnShadow: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
