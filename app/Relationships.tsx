import { Text, View, ScrollView } from "../components/Themed";
import { calculateAge } from "../utility/functions/misc";
import { CharacterImage } from "../components/CharacterImage";
import { useContext } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "../components/GenericStrikeAround";
import { Character } from "../classes/character";

export default function RelationshipsScreen() {
  const playerCharacterContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  if (!playerCharacterContext || !gameContext) {
    throw new Error("missing context");
  }
  const { playerState } = playerCharacterContext;
  const { gameState } = gameContext;

  function renderCharacter(character: Character) {
    if (gameState) {
      const characterAge = calculateAge(
        new Date(character.birthdate),
        character.deathdate
          ? new Date(character.deathdate)
          : new Date(gameState.date),
      );

      return (
        <View className="flex w-1/2 items-center" key={character.getFullName()}>
          <Text className="text-2xl">{character.getFullName()}</Text>
          <View className="mx-auto">
            <CharacterImage
              characterAge={characterAge}
              characterSex={character.sex == "male" ? "M" : "F"}
            />
          </View>
          <Text className="text-xl">
            {character.deathdate && "Died at "}
            {characterAge} Years Old
          </Text>
          <Text className="text-xl">{character.getFullName()}</Text>
          <View className="mx-auto">
            <Text className="flex flex-wrap text-center text-lg">
              {character.deathdate && "Was a "}
              {character.job}
            </Text>
          </View>
        </View>
      );
    }
  }

  if (playerState) {
    return (
      <ScrollView>
        <View
          className="flex-1 items-center px-8"
          style={{ paddingTop: useHeaderHeight() }}
        >
          {playerState.children.length > 0 && (
            <>
              <Text className="py-12 text-center text-2xl">Children</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {playerState.children.map((child) => renderCharacter(child))}
              </View>
            </>
          )}
          {playerState.partners.length > 0 && (
            <>
              <Text className="py-12 text-center text-2xl">
                {playerState.partners.length == 1 ? "Partner" : "Partners"}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                {playerState.partners.map((child) => renderCharacter(child))}
              </View>
            </>
          )}
          <>
            <Text className="py-12 text-center text-2xl">Parents</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              {playerState.parents.map((parent) => renderCharacter(parent))}
            </View>
          </>
          {playerState.partners.length == 0 && (
            <GenericStrikeAround
              text={"No Partner"}
              containerStyles={{ paddingTop: 20 }}
            />
          )}
          {playerState.children.length == 0 && (
            <GenericStrikeAround
              text={"No Children"}
              containerStyles={{ paddingTop: 20 }}
            />
          )}
          {playerState.knownCharacters.length > 0 && (
            <View>
              <Text></Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}
