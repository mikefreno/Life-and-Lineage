import React from "react";
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
import { flex, text, useStyles } from "../hooks/styles";

const RelationshipsScreen = observer(() => {
  const styles = useStyles();
  const { playerState, uiStore, characterStore } = useRootStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [showInteractionModal, setShowInteractionModal] =
    useState<boolean>(false);
  const [showingGiftModal, setShowingGiftModal] = useState<boolean>(false);
  const [showingAdoptionModal, setShowingAdoptionModal] =
    useState<boolean>(false);
  const [partnerName, setPartnerName] = useState<string>();

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
        style={[
          flex.columnCenter,
          {
            width: uiStore.dimensions.lesser * 0.35,
            opacity: character.deathdate ? 0.5 : 1,
          },
        ]}
        key={character.id}
        disabled={!!character.deathdate}
        onPress={() => {
          setShowInteractionModal(true);
          setSelectedCharacter(character);
        }}
      >
        <Text style={{ textAlign: "center", ...text["2xl"] }}>
          {character.fullName}
        </Text>
        <View style={{ marginHorizontal: "auto" }}>
          <CharacterImage character={character} />
        </View>
        <Text style={text.xl}>
          {character.deathdate && "Died at "}
          {character.age} Years Old
        </Text>
        <Text style={{ textAlign: "center", ...text.xl }}>
          {character.fullName}
        </Text>
        <View style={{ marginHorizontal: "auto" }}>
          <Text style={{ textAlign: "center", flexWrap: "wrap", ...text.lg }}>
            {character.deathdate && "Was a "}
            {character.job}
          </Text>
        </View>
        {!character.deathdate && (
          <View style={styles.affectionContainer}>
            <View style={{ width: "75%" }}>
              <ProgressBar
                value={Math.floor(character.affection * 4) / 4}
                minValue={-100}
                maxValue={100}
                filledColor="#dc2626"
                unfilledColor="#fca5a5"
              />
            </View>
            <View style={{ marginVertical: "auto", marginLeft: 4 }}>
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
      <View style={{ width: "100%" }} key={title}>
        <Text
          style={{ paddingVertical: 32, textAlign: "center", ...text["2xl"] }}
        >
          {title}
        </Text>
        <FlatList
          horizontal
          data={data}
          contentContainerStyle={[flex.rowEvenly, { minWidth: "100%" }]}
          renderItem={({ item }) => renderCharacter(item)}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  const showAdoptionModal = (partnerName?: string) => {
    if (showInteractionModal) {
      setShowInteractionModal(false);
      wait(500).then(() => {
        setPartnerName(partnerName);
        characterStore.independantChildrenAgeCheck();
        setShowingAdoptionModal(true);
      });
    } else {
      setPartnerName(partnerName);
      characterStore.independantChildrenAgeCheck();
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
          <View style={{ maxHeight: uiStore.dimensions.height * 0.75 }}>
            <Text style={styles.adoptionTitle}>
              {partnerName
                ? `Adopting with ${partnerName}`
                : "Independent Adoption"}
            </Text>
            {playerState.age >= 18 ? (
              <FlatList
                numColumns={2}
                data={characterStore.independentChildren}
                renderItem={({ item }) => (
                  <View style={styles.adoptionCharacterContainer}>
                    {renderCharacter(item)}
                    <GenericRaisedButton
                      onPress={() =>
                        characterStore.adopt({
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
                <Text style={{ textAlign: "center" }}>
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
            style={[styles.mainContainer, { paddingTop: useHeaderHeight() }]}
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
