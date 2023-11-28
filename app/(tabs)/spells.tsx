import { useSelector } from "react-redux";
import { Text, View } from "../../components/Themed";
import { selectGame, selectPlayerCharacter } from "../../redux/selectors";
import SpellDetails from "../../components/SpellDetails";

export default function SpellsScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  const game = useSelector(selectGame);
  if (!playerCharacter || !game) throw new Error("no player in spells screen");
  const spells = playerCharacter.getSpells();

  return (
    <View className="flex-1 items-center justify-evenly">
      {spells.length > 0 ? (
        <>
          <Text className="text-xl tracking-wide">Known Spells</Text>
          <View className="h-5/6 w-full items-center">
            {spells.map((spell) => (
              <SpellDetails spell={spell} key={spell.name} />
            ))}
          </View>
        </>
      ) : (
        <View className="items-center">
          <Text className="text-xl italic tracking-wide">No Known Spells.</Text>
          <Text className="text-center italic tracking-wide">
            (Books can be studied on the top right)
          </Text>
        </View>
      )}
    </View>
  );
}
