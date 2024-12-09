import { Dimensions } from "react-native";
import { getCharacterImage, toTitleCase } from "../utility/functions/misc";
import { Character } from "../entities/character";
import { Image } from "expo-image";

/**
 * Scale should be 0-1,  defaults to 0.4
 */
export function CharacterImage({
  character,
  scale = 0.4,
}: {
  character: Character;
  scale?: number;
}) {
  const size = Dimensions.get("window").width * scale;

  return (
    <Image
      source={getCharacterImage(
        character.age,
        (toTitleCase(character.sex) as "Male") || "Female",
        character.personality!,
      )}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}
