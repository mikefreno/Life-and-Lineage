import React from "react";
import { Text, ThemedView } from "@/components/Themed";
import { wait } from "@/utility/functions/misc";
import { CharacterImage } from "@/components/CharacterImage";
import { useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import { CharacterInteractionModal } from "@/components/CharacterInteractionModal";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import GiftModal from "@/components/GiftModal";
import { AffectionIcon } from "@/assets/icons/SVGIcons";
import GenericModal from "@/components/GenericModal";
import { Stack } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { observer } from "mobx-react-lite";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { useRootStore } from "@/hooks/stores";
import type { Character } from "@/entities/character";
import { flex, normalize, tw_base, useStyles } from "@/hooks/styles";
import TutorialModal from "@/components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { TutorialOption } from "@/utility/types";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { BlurView } from "expo-blur";
import { useHeaderHeight } from "@react-navigation/elements";

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

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

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
      <ThemedView
        style={[
          styles.themedCard,
          {
            width: uiStore.dimensions.width / 2.5,
            marginHorizontal: uiStore.dimensions.width * 0.05,
          },
        ]}
      >
        <Pressable
          style={{
            ...styles.columnBetween,
            opacity: character.deathdate ? 0.5 : 1,
            paddingVertical: tw_base[2],
          }}
          key={character.id}
          disabled={!!character.deathdate}
          onPress={() => {
            setShowInteractionModal(true);
            setSelectedCharacter(character);
          }}
        >
          <Text
            style={{
              textAlign: "center",
              ...styles["text-2xl"],
              textDecorationLine: character.deathdate
                ? "line-through"
                : "underline",
            }}
            numberOfLines={2}
          >
            {character.fullName}
          </Text>
          <CharacterImage character={character} />
          <Text style={styles["text-xl"]}>
            {character.deathdate && "Died at "}
            {character.age} Years Old
          </Text>
          <View
            style={{
              marginHorizontal: "auto",
              paddingVertical: normalize(4),
            }}
          >
            <Text
              style={{
                textAlign: "center",
                flexWrap: "wrap",
                ...styles["text-lg"],
              }}
            >
              {character.deathdate && "Was a "}
              {character.job}
            </Text>
          </View>
          {!character.deathdate && (
            <View style={styles.affectionContainer}>
              <View
                style={{
                  width: "75%",
                  justifyContent: "center",
                  paddingRight: 4,
                }}
              >
                <ProgressBar
                  value={Math.floor(character.affection * 4) / 4}
                  minValue={-100}
                  maxValue={100}
                  filledColor="#dc2626"
                  unfilledColor="#fca5a5"
                />
              </View>
              <AffectionIcon
                height={uiStore.iconSizeSmall}
                width={uiStore.iconSizeSmall}
              />
            </View>
          )}
        </Pressable>
      </ThemedView>
    );
  }

  const renderGroup = (title: string, data: Character[]) => {
    if (data.length === 0) return null;

    return (
      <View key={title} style={{ paddingVertical: 12 }}>
        <Text
          style={{
            paddingVertical: 12,
            textAlign: "center",
            ...styles["text-xl"],
          }}
        >
          {title}
        </Text>
        <FlatList
          horizontal
          data={data}
          contentContainerStyle={{
            flexGrow: 1,
            width: (data.length / 2) * uiStore.dimensions.width,
            marginVertical: 4,
          }}
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
        setShowingAdoptionModal(true);
      });
    } else {
      setPartnerName(partnerName);
      setShowingAdoptionModal(true);
    }
  };

  if (!playerState) {
    return (
      <View style={[flex.columnCenter, { flex: 1 }]}>
        <Text style={styles["text-xl"]}>Unable to load relationship data</Text>
      </View>
    );
  }

  const hasAnyCharacters = characterGroups.some(
    (group) => group.data.length > 0,
  );

  if (!hasAnyCharacters) {
    return (
      <View style={[flex.columnCenter, { flex: 1 }]}>
        <Text style={styles["text-xl"]}>You haven't met anyone yet!</Text>
      </View>
    );
  }

  if (playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTransparent: true,
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontFamily: "PixelifySans",
              fontSize: normalize(24),
            },
            headerBackground:
              Platform.OS == "ios"
                ? () => (
                    <BlurView
                      intensity={100}
                      style={[StyleSheet.absoluteFill, styles.diffuse]}
                      tint={uiStore.colorScheme}
                    />
                  )
                : () => (
                    <ThemedView
                      style={[StyleSheet.absoluteFill, styles.diffuse]}
                    />
                  ),
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
        <TutorialModal
          isFocused={isFocused}
          tutorial={TutorialOption.relationships}
          pageOne={{
            title: "Relationships",
            body: "Relationships decay over time, chat, give gifts and go on dates with others to improve your relationship",
          }}
          pageTwo={{
            title: "Having Children",
            body: "Given a good enough relationship, you can try for a child to extend your lineage",
          }}
          pageThree={{
            title: "Adoption",
            body: "You can also adopt (top right), but it can be extremely expensive",
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
            <Text style={[styles.adoptionTitle, styles["text-xl"]]}>
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
                          child: item,
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
        <ScrollView
          contentContainerStyle={{
            paddingVertical: "2%",
            paddingBottom: uiStore.playerStatusHeightSecondary,
            paddingTop: headerHeight,
          }}
        >
          {characterGroups.map((group) => renderGroup(group.title, group.data))}
        </ScrollView>
        <PlayerStatusForSecondary />
      </>
    );
  }
});

export default RelationshipsScreen;
