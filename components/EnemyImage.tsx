import { Image } from "react-native";
import { EnemyImageMap } from "../utility/enemy";

interface EnemyImageProps {
  creatureSpecies: string;
  widthOverride?: number;
  heightOverride?: number;
}

export function EnemyImage({
  creatureSpecies,
  widthOverride,
  heightOverride,
}: EnemyImageProps) {
  const enemy = EnemyImageMap[creatureSpecies];
  return (
    <Image
      source={enemy ? enemy.source : require("../assets/images/items/Egg.png")}
      style={{
        width: widthOverride ? widthOverride : enemy ? enemy.width : 40,
        height: heightOverride ? heightOverride : enemy ? enemy.height : 40,
        marginTop: enemy ? enemy.heightOffset : 0,
      }}
    />
  );
}
