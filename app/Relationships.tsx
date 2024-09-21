import { Text, View, ScrollView } from "../components/Themed";
import { calculateAge } from "../utility/functions/misc";
import { CharacterImage } from "../components/CharacterImage";
import { useContext, useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import { Character } from "../classes/character";
import ProgressBar from "../components/ProgressBar";
import { CharacterInteractionModal } from "../components/CharacterInteractionModal";
import { Pressable } from "react-native";
import GiftModal from "../components/GiftModal";
import { AppContext } from "./_layout";
import { AffectionIcon } from "../assets/icons/SVGIcons";

export default function RelationshipsScreen() {
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("missing context");
  }
  const { playerState, gameState } = appData;
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [showInteractionModal, setShowInteractionModal] =
    useState<boolean>(false);
  const [showingGiftModal, setShowingGiftModal] = useState<boolean>(false);

  const acquaintances = playerState?.knownCharacters.filter(
    (character) => character.affection < 25 && character.affection > -25,
  );
  const friends = playerState?.knownCharacters.filter(
    (character) => character.affection >= 25 && character.affection < 75,
  );
  const bestFriend = playerState?.knownCharacters.filter(
    (character) => character.affection >= 75,
  );
  const enemies = playerState?.knownCharacters.filter(
    (character) => character.affection <= -25 && character.affection > -75,
  );
  const bitterEnemies = playerState?.knownCharacters.filter(
    (character) => character.affection <= -75,
  );

  function renderCharacter(character: Character) {
    if (gameState) {
      const characterAge = calculateAge(
        new Date(character.birthdate),
        character.deathdate
          ? new Date(character.deathdate)
          : new Date(gameState.date),
      );

      return (
        <Pressable
          className="flex w-1/2 items-center"
          key={character.id}
          onPress={() => {
            setShowInteractionModal(true);
            setSelectedCharacter(character);
          }}
        >
          <Text className="text-center text-2xl">{character.fullName}</Text>
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
          <Text className="text-center text-xl">{character.fullName}</Text>
          <View className="mx-auto">
            <Text className="flex flex-wrap text-center text-lg">
              {character.deathdate && "Was a "}
              {character.job}
            </Text>
          </View>
          <View className="flex w-2/3 flex-row justify-center">
            <View className="w-3/4">
              <ProgressBar
                value={Math.floor(character.affection * 4) / 4}
                minValue={-100}
                maxValue={100}
                filledColor="#dc2626"
                unfilledColor="#fca5a5"
              />
            </View>
            <View className="my-auto ml-1">
              <AffectionIcon height={14} width={14} />
            </View>
          </View>
        </Pressable>
      );
    }
  }

  if (playerState) {
    return (
      <>
        <CharacterInteractionModal
          character={selectedCharacter}
          closeFunction={() => {
            setShowInteractionModal(false);
            setTimeout(() => setSelectedCharacter(null), 500);
          }}
          backdropCloses
          secondaryRequirement={showInteractionModal}
          showGiftModal={() => setShowingGiftModal(true)}
        />
        <GiftModal
          showing={showingGiftModal}
          onCloseFunction={() => {
            setShowInteractionModal(false);
            setShowingGiftModal(false);
          }}
          backdropCloses
        />
        <ScrollView>
          <View
            className="flex-1 items-center px-8 pb-10"
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
              <Text className="py-8 text-center text-2xl">Parents</Text>
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
            {bestFriend && bestFriend.length > 0 && (
              <>
                <Text className="py-8 text-center text-2xl">Best Friends</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  {bestFriend.map((bestFriend) => renderCharacter(bestFriend))}
                </View>
              </>
            )}
            {bitterEnemies && bitterEnemies.length > 0 && (
              <>
                <Text className="py-8 text-center text-2xl">
                  Bitter Enemies
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  {bitterEnemies.map((bitterEnemy) =>
                    renderCharacter(bitterEnemy),
                  )}
                </View>
              </>
            )}
            {friends && friends.length > 0 && (
              <>
                <Text className="py-8 text-center text-2xl">Friends</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  {friends.map((friend) => renderCharacter(friend))}
                </View>
              </>
            )}
            {enemies && enemies.length > 0 && (
              <>
                <Text className="py-8 text-center text-2xl">Enemies</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  {enemies.map((enemy) => renderCharacter(enemy))}
                </View>
              </>
            )}
            {acquaintances && acquaintances.length > 0 && (
              <>
                <Text className="py-8 text-center text-2xl">Acquaintances</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  {acquaintances.map((acquaintance) =>
                    renderCharacter(acquaintance),
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </>
    );
  }
}
