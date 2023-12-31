import { Image } from "react-native";
import { MonsterImageMap } from "../utility/monster";

interface MonsterImageProps {
  monsterSpecies: string;
}

export function MonsterImage({ monsterSpecies }: MonsterImageProps) {
  const monster = MonsterImageMap[monsterSpecies];
  return (
    <Image
      source={monster.source}
      style={{
        width: monster.width,
        height: monster.height,
        marginTop: monster.heightOffset ?? 0,
      }}
    />
  );
}
