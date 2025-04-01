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
import { Character } from "@/entities/character";
import { flex, tw_base, useStyles } from "../hooks/styles";
import TutorialModal from "@/components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { TutorialOption } from "@/utility/types";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { BlurView } from "expo-blur";
import { useHeaderHeight } from "@react-navigation/elements";
import { useScaling } from "@/hooks/scaling";
import GenericFlatButton from "@/components/GenericFlatButton";
import Colors from "@/constants/Colors";
import { useVibration } from "@/hooks/generic";

const RelationshipsScreen = observer(() => {
  const styles = useStyles();
  const { playerState, uiStore } = useRootStore();
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
  const { getNormalizedSize } = useScaling();
  const vibration = useVibration();

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
            height: uiStore.dimensions.lesser * 0.8,
          }}
          renderItem={({ item }) => (
            <RenderCharacter
              character={item}
              setShowInteractionModal={setShowInteractionModal}
              setSelectedCharacter={setSelectedCharacter}
            />
          )}
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
              fontSize: getNormalizedSize(24),
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
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  showAdoptionModal();
                }}
              >
                <FontAwesome6
                  name="child-reaching"
                  size={uiStore.iconSizeXL}
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
          scrollEnabled={true}
        >
          <View style={{ maxHeight: uiStore.dimensions.height * 0.75 }}>
            <Text style={[styles.adoptionTitle, styles["text-xl"]]}>
              {partnerName
                ? `Adopting with ${partnerName}`
                : "Independent Adoption"}
            </Text>
            {playerState.age >= 24 ? (
              <AdoptionList
                partner={selectedCharacter}
                setShowInteractionModal={setShowInteractionModal}
                setSelectedCharacter={setSelectedCharacter}
              />
            ) : (
              <GenericStrikeAround>
                <Text style={{ textAlign: "center" }}>
                  {`You are not yet old enough to adopt\n(min age:24)`}
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
            paddingTop: headerHeight,
            paddingBottom: uiStore.playerStatusHeightSecondary,
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

const AdoptionList = observer(
  ({
    partner,
    setShowInteractionModal,
    setSelectedCharacter,
  }: {
    partner: Character | null;
    setShowInteractionModal: (val: boolean) => void;
    setSelectedCharacter: (char: Character) => void;
  }) => {
    const { characterStore, playerState, uiStore } = useRootStore();
    const [confirmationId, setConfirmationId] = useState<string | null>(null);
    const styles = useStyles();
    if (!playerState) return null;

    return (
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        {characterStore.independentChildren.map((char) => {
          const isConfirming = confirmationId === char.id;

          return (
            <View
              key={char.id}
              style={[
                styles.adoptionCharacterContainer,
                { height: uiStore.dimensions.height * 0.45 },
              ]}
            >
              <RenderCharacter
                character={char}
                setShowInteractionModal={setShowInteractionModal}
                setSelectedCharacter={setSelectedCharacter}
              />
              {!isConfirming ? (
                <GenericFlatButton
                  disabled={
                    playerState.gold <
                    Math.max(25_000, Math.floor(playerState.gold * 0.15))
                  }
                  onPress={() => setConfirmationId(char.id)}
                >{`Adopt (cost: ${Math.max(
                  25_000,
                  Math.floor(playerState.gold * 0.15),
                )})`}</GenericFlatButton>
              ) : (
                <View style={styles.columnCenter}>
                  <GenericFlatButton
                    backgroundColor={Colors.light.tint}
                    onPress={() =>
                      characterStore.adopt({
                        child: char,
                        partner: partner ?? undefined,
                      })
                    }
                  >
                    Confirm
                  </GenericFlatButton>
                  <GenericFlatButton
                    backgroundColor={Colors[uiStore.colorScheme].error}
                    onPress={() => setConfirmationId(null)}
                  >
                    Cancel
                  </GenericFlatButton>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  },
);

const RenderCharacter = observer(
  ({
    character,
    setShowInteractionModal,
    setSelectedCharacter,
  }: {
    character: Character;
    setShowInteractionModal: (val: boolean) => void;
    setSelectedCharacter: (char: Character) => void;
  }) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();
    const { getNormalizedSize } = useScaling();
    return (
      <Pressable
        style={{
          ...styles.themedCard,
          width: uiStore.dimensions.width / 2.5,
          marginHorizontal: uiStore.dimensions.width * 0.05,
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
        <View style={{ width: "100%", height: "40%" }}>
          <CharacterImage character={character} />
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles["text-xl"]}>
            {character.deathdate && "Died at "}
            {character.age} Years Old
          </Text>
          {character.age > 16 && (
            <View
              style={{
                marginHorizontal: "auto",
                paddingVertical: getNormalizedSize(4),
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
          )}
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
        </View>
      </Pressable>
    );
  },
);
