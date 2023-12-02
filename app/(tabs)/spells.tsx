import { Text, View } from "../../components/Themed";
import SpellDetails from "../../components/SpellDetails";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

const SpellsScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);

  if (!playerCharacterData || !gameData) throw new Error("missing contexts");
  const { playerState } = playerCharacterData;
  const [spells, setSpells] = useState(playerState?.getSpells());

  useEffect(() => {
    setSpells(playerState?.getSpells());
  }, [playerState?.knownSpells]);

  return (
    <View className="flex-1 items-center justify-evenly">
      {spells && spells.length > 0 ? (
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
});
export default SpellsScreen;
