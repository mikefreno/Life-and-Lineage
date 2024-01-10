import { Image } from "react-native";
import { MonsterImageMap } from "../utility/monster";

interface MonsterImageProps {
  monsterSpecies: string;
  widthOverride?: number;
  heightOverride?: number;
}

export function MonsterImage({
  monsterSpecies,
  widthOverride,
  heightOverride,
}: MonsterImageProps) {
  const monster = MonsterImageMap[monsterSpecies];
  return (
    <Image
      source={monster.source}
      style={{
        width: widthOverride ? widthOverride : monster.width,
        height: heightOverride ? heightOverride : monster.height,
        marginTop: monster.heightOffset ?? 0,
      }}
    />
  );
}
