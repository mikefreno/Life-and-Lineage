import { Image } from "react-native";
import { getCharacterImage, toTitleCase } from "../utility/functions/misc";
import { Character } from "../entities/character";

export function CharacterImage({ character }: { character: Character }) {
  return (
    <Image
      style={{ width: "100%", objectFit: "scale-down" }}
      source={getCharacterImage(
        character.age,
        (toTitleCase(character.sex) as "Male") || "Female",
        character.personality!,
      )}
    />
  );
}
