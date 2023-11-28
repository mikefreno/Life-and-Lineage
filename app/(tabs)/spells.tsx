import { useSelector } from "react-redux";
import { Text, View } from "../../components/Themed";
import { selectGame, selectPlayerCharacter } from "../../redux/selectors";
import { useColorScheme } from "nativewind";
import SpellDetails from "../../components/SpellDetails";

export default function SpellsScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  const game = useSelector(selectGame);
  const { colorScheme } = useColorScheme();
  if (!playerCharacter || !game) throw new Error("no player in spells screen");
  const spells = playerCharacter.getSpells();

  return (
    <View className="flex-1 items-center justify-evenly">
      {spells.length > 0 ? (
        <>
          <Text className="text-xl tracking-wide">Known Spells</Text>
          {spells.map((spell) => (
            <SpellDetails spell={spell} key={spell.name} />
          ))}
        </>
      ) : (
        <Text className="text-xl italic tracking-wide">No Known Spells</Text>
      )}
    </View>
  );
}
