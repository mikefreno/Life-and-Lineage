import { Image, Animated } from "react-native";
import { EnemyImageMap } from "../utility/enemy";

interface EnemyImageProps {
  creatureSpecies: string;
  glowAnim?: Animated.Value;
}

export function EnemyImage({ creatureSpecies, glowAnim }: EnemyImageProps) {
  let enemy = EnemyImageMap[creatureSpecies];

  const baseImage = (
    <Image
      source={enemy ? enemy.source : require("../assets/images/items/Egg.png")}
      style={{
        width: enemy?.width ?? 150,
        height: enemy?.height ?? 150,
      }}
    />
  );

  if (!glowAnim) return baseImage;

  return (
    <Animated.View
      style={{
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        shadowOpacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      }}
    >
      <Animated.View
        style={{
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.8],
          }),
        }}
      >
        {baseImage}
      </Animated.View>
    </Animated.View>
  );
}
