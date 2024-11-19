import { Text } from "../components/Themed";
import { wait } from "../utility/functions/misc";
import { CharacterImage } from "../components/CharacterImage";
import { useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import ProgressBar from "../components/ProgressBar";
import { CharacterInteractionModal } from "../components/CharacterInteractionModal";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import GiftModal from "../components/GiftModal";
import { AffectionIcon } from "../assets/icons/SVGIcons";
import GenericModal from "../components/GenericModal";
import { Stack } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import GenericRaisedButton from "../components/GenericRaisedButton";
import { observer } from "mobx-react-lite";
import GenericStrikeAround from "../components/GenericStrikeAround";
import { useRootStore } from "../hooks/stores";
import type { Character } from "../entities/character";

const RelationshipsScreen = observer(() => {
  const { playerState, gameState, uiStore } = useRootStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [showInteractionModal, setShowInteractionModal] =
    useState<boolean>(false);
  const [showingGiftModal, setShowingGiftModal] = useState<boolean>(false);

  const characterGroups = [
    { title: "Children", data: playerState?.children || [] },
    {
      title: playerState?.partners.length === 1 ? "Partner" : "Partners",
      data: playerState?.partners || [],
    },
    { title: "Parents", data: playerState?.parents || [] },
    {
      title: "Best Friends",
      data: playerState?.knownCharacters.filter((c) => c.affection >= 75) || [],
    },
    {
      title: "Bitter Enemies",
      data:
        playerState?.knownCharacters.filter((c) => c.affection <= -75) || [],
    },
    {
      title: "Friends",
      data:
        playerState?.knownCharacters.filter(
          (c) => c.affection >= 25 && c.affection < 75,
        ) || [],
    },
    {
      title: "Enemies",
      data:
        playerState?.knownCharacters.filter(
          (c) => c.affection <= -25 && c.affection > -75,
        ) || [],
    },
    {
      title: "Acquaintances",
      data:
        playerState?.knownCharacters.filter(
          (c) => c.affection < 25 && c.affection > -25,
        ) || [],
    },
  ];

  function renderCharacter(character: Character) {
    return (
      <Pressable
        className="flex items-center"
        style={{
          width: uiStore.dimensions.window.lesser * 0.35,
          opacity: character.deathdate ? 0.5 : 1,
        }}
        key={character.id}
        disabled={!!character.deathdate}
        onPress={() => {
          setShowInteractionModal(true);
          setSelectedCharacter(character);
        }}
      >
        <Text className="text-center text-2xl">{character.fullName}</Text>
        <View className="mx-auto">
          <CharacterImage
            characterAge={character.age}
            characterSex={character.sex == "male" ? "M" : "F"}
          />
        </View>
        <Text className="text-xl">
          {character.deathdate && "Died at "}
          {character.age} Years Old
        </Text>
        <Text className="text-center text-xl">{character.fullName}</Text>
        <View className="mx-auto">
          <Text className="flex flex-wrap text-center text-lg">
            {character.deathdate && "Was a "}
            {character.job}
          </Text>
        </View>
        {!character.deathdate && (
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
        )}
      </Pressable>
    );
  }

  const renderGroup = (title: string, data: Character[]) => {
    if (data.length === 0) return null;

    return (
      <View className="w-full" key={title}>
        <Text className="py-8 text-center text-2xl">{title}</Text>
        <FlatList
          horizontal
          data={data}
          contentContainerClassName="flex flex-row justify-evenly min-w-full"
          renderItem={({ item }) => renderCharacter(item)}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  const [showingAdoptionModal, setShowingAdoptionModal] =
    useState<boolean>(false);

  const [partnerName, setPartnerName] = useState<string>();

  const showAdoptionModal = (partnerName?: string) => {
    if (showInteractionModal) {
      setShowInteractionModal(false);
      wait(500).then(() => {
        setPartnerName(partnerName);
        gameState?.independantChildrenAgeCheck();
        setShowingAdoptionModal(true);
      });
    } else {
      setPartnerName(partnerName);
      gameState?.independantChildrenAgeCheck();
      setShowingAdoptionModal(true);
    }
  };

  if (playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerRight: (props) => (
              <Pressable onPress={() => showAdoptionModal()}>
                <FontAwesome6
                  name="child-reaching"
                  size={24}
                  color={props.tintColor}
                />
              </Pressable>
            ),
          }}
        />
        <CharacterInteractionModal
          character={selectedCharacter}
          closeFunction={() => {
            setShowInteractionModal(false);
            setTimeout(() => setSelectedCharacter(null), 500);
          }}
          backdropCloses
          secondaryRequirement={showInteractionModal}
          showGiftModal={() => setShowingGiftModal(true)}
          showAdoptionModal={showAdoptionModal}
        />
        <GenericModal
          isVisibleCondition={showingAdoptionModal}
          backFunction={() => setShowingAdoptionModal(false)}
          size={100}
        >
          <View style={{ maxHeight: uiStore.dimensions.window.height * 0.75 }}>
            <Text className="text-center text-2xl tracking-wider py-2">
              {partnerName
                ? `Adopting with ${partnerName}`
                : "Independent Adoption"}
            </Text>
            {playerState.age >= 18 ? (
              <FlatList
                numColumns={2}
                data={gameState?.independantChildren}
                renderItem={({ item }) => (
                  <View className="flex flex-col items-center w-1/2">
                    {renderCharacter(item)}
                    <GenericRaisedButton
                      onPress={() =>
                        gameState?.adopt({
                          adoptee: item,
                          player: playerState,
                          partner: selectedCharacter ?? undefined,
                        })
                      }
                    >
                      Adopt
                    </GenericRaisedButton>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <GenericStrikeAround>
                <Text className="text-center">
                  You are not yet old enough to adopt
                </Text>
              </GenericStrikeAround>
            )}
          </View>
        </GenericModal>
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
            {characterGroups.map((group) =>
              renderGroup(group.title, group.data),
            )}
          </View>
        </ScrollView>
      </>
    );
  }
});

export default RelationshipsScreen;
