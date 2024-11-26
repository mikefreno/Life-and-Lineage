import { Dimensions, Image } from "react-native";
import { getCharacterImage, toTitleCase } from "../utility/functions/misc";
import { Character } from "../entities/character";

export function CharacterImage({ character }: { character: Character }) {
  const scale = Dimensions.get("window").width * 0.4;
  return (
    <>
      <Image
        source={getCharacterImage(
          character.age,
          (toTitleCase(character.sex) as "Male") || "Female",
          character.personality!,
        )}
        style={{ width: scale, height: scale }}
      />
    </>
  );
}
