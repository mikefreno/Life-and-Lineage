import { Stack, useSearchParams } from "expo-router";
import { View } from "../../components/Themed";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/selectors";
import { calculateAge, toTitleCase } from "../../utility/functions";
import { CharacterImage } from "../../components/CharacterImage";
import { FlatList } from "react-native";

export default function ShopScreen() {
  const { shop } = useSearchParams();
  const game = useSelector(selectGame);
  const thisShop = game?.getShops().find((aShop) => aShop.archetype == shop);

  if (thisShop && game) {
    const stock: {}[] = [];
    //const renderStock = ({ item }) => ()
    return (
      <>
        <Stack.Screen
          options={{
            title: toTitleCase(shop as string),
          }}
        />
        <View className="flex-1">
          <View className="flex flex-row justify-between">
            <CharacterImage
              characterAge={calculateAge(
                thisShop.shopKeeperBirthDate,
                game.getGameDate(),
              )}
              characterSex={thisShop.shopKeeperSex == "male" ? "M" : "F"}
            />
          </View>
          <View></View>
        </View>
      </>
    );
  }
}
//<FlatList
//data={stock}
//renderItem={renderStock}
//keyExtractor={(item) => item.name}
///>
