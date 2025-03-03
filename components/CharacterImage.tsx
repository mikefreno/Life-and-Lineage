import { getCharacterImage, toTitleCase } from "../utility/functions/misc";
import { Character } from "../entities/character";
import { Image } from "react-native";
import { useRootStore } from "@/hooks/stores";

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
  const { uiStore } = useRootStore();
  const size = uiStore.dimensions.lesser * scale;

  return (
    <Image
      source={getCharacterImage(
        character.age,
        (toTitleCase(character.sex) as "Male") || "Female",
        character.personality!,
      )}
      style={{
        width: size,
        height: size,
        resizeMode: "contain",
      }}
    />
  );
}
