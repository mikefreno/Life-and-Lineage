import { Image } from "react-native";
import { getCharacterImage } from "../utility/functions/misc";

interface CharacterImageProps {
  characterAge: number;
  characterSex: "M" | "F";
}

export function CharacterImage({
  characterAge,
  characterSex,
}: CharacterImageProps) {
  return (
    <Image
      source={getCharacterImage(characterAge, characterSex)}
      style={{ width: 120, height: 160 }}
    />
  );
}
