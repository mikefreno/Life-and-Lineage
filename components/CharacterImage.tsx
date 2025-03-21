import { getCharacterImage, toTitleCase } from "@/utility/functions/misc";
import { Character } from "@/entities/character";
import { Image } from "expo-image";

export function CharacterImage({ character }: { character: Character }) {
  return (
    <Image
      style={{
        height: "100%",
        width: "100%",
        objectFit: "scale-down",
      }}
      source={getCharacterImage(
        character.age,
        (toTitleCase(character.sex) as "Male") || "Female",
        character.personality!,
      )}
    />
  );
}
