import { Image } from "react-native";
import { getMonsterImage } from "../utility/functions";

interface MonsterImageProps {
  monsterSpecies: string;
}

export function MonsterImage({ monsterSpecies }: MonsterImageProps) {
  return (
    <Image
      source={getMonsterImage(monsterSpecies)}
      style={{ width: 160, height: 160 }}
    />
  );
}
