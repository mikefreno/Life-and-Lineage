import { Image, Animated } from "react-native";
import { EnemyImageMap } from "../utility/enemy";

interface EnemyImageProps {
  creatureSpecies: string;
  glowAnim?: Animated.Value;
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
};

const findClosestEnemyImage = (searchTerm: string) => {
  const normalizedSearch = normalizeString(searchTerm);

  // Exact match first
  if (EnemyImageMap[normalizedSearch]) {
    return EnemyImageMap[normalizedSearch];
  }

  const searchWords = normalizedSearch.split(" ");

  const matchingKeys = Object.keys(EnemyImageMap).filter((key) => {
    const normalizedKey = normalizeString(key);
    return searchWords.every((word) => normalizedKey.includes(word));
  });

  if (matchingKeys.length > 0) {
    const bestMatch = matchingKeys.sort((a, b) => a.length - b.length)[0];
    return EnemyImageMap[bestMatch];
  }

  // If no match found, try to match by any word
  const partialMatches = Object.keys(EnemyImageMap).filter((key) => {
    const normalizedKey = normalizeString(key);
    return searchWords.some(
      (word) => normalizedKey.includes(word) && word.length > 2,
    );
  });

  if (partialMatches.length > 0) {
    const bestMatch = partialMatches.sort((a, b) => {
      const aMatches = searchWords.filter((word) =>
        normalizeString(a).includes(word),
      ).length;
      const bMatches = searchWords.filter((word) =>
        normalizeString(b).includes(word),
      ).length;
      return bMatches - aMatches;
    })[0];
    return EnemyImageMap[bestMatch];
  }

  return null;
};

export function EnemyImage({ creatureSpecies, glowAnim }: EnemyImageProps) {
  const enemy = findClosestEnemyImage(creatureSpecies);

  if (!enemy) {
    console.warn(`No match found for creature: ${creatureSpecies}`);
  }

  const baseImage = (
    <Image
      source={enemy ? enemy.source : require("../assets/images/items/Egg.png")}
      style={{
        width: enemy?.width ?? 150,
        height: enemy?.height ?? 150,
        marginTop: enemy?.heightOffset ?? 0,
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
