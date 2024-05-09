import { Image } from "react-native";
import { EnemyImageMap } from "../utility/enemy";

interface EnemyImageProps {
  creatureSpecies: string;
}

export function EnemyImage({ creatureSpecies }: EnemyImageProps) {
  const enemy = EnemyImageMap[creatureSpecies];
  return (
    <Image
      source={enemy ? enemy.source : require("../assets/images/items/Egg.png")}
      style={{
        width: enemy.width,
        height: enemy.height,
      }}
    />
  );
}
