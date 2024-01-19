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
      source={enemy.source}
      style={{
        width: widthOverride ? widthOverride : enemy.width,
        height: heightOverride ? heightOverride : enemy.height,
        marginTop: enemy.heightOffset ?? 0,
      }}
    />
  );
}
