import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRootStore } from "../hooks/stores";
import { Text, ThemedView } from "./Themed";
import ThemedCard from "./ThemedCard";
import { parse } from "flatted";
import { Element, ElementToString } from "../utility/types";
import clearHistory, { toTitleCase, wait } from "../utility/functions/misc";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../assets/icons/SVGIcons";
import BlessingDisplay from "./BlessingsDisplay";
import { radius, useStyles } from "../hooks/styles";
import Modal from "react-native-modal";
import { normalize } from "@sentry/core";
import { useNavigation } from "expo-router";

const CheckpointModal = ({
  isVisible,
  onClose,
  allowSaving = false,
}: {
  isVisible: boolean;
  onClose: () => void;
  allowSaving?: boolean;
}) => {
  const { saveStore, uiStore, playerState } = useRootStore();
  const [checkpoints, setCheckpoints] = useState<Record<number, any[]>>({});
  const [expandedGames, setExpandedGames] = useState<Record<number, boolean>>(
    {},
  );
  const styles = useStyles();
  const [confirmingAction, setConfirmingAction] = useState<{
    id: number;
    action: "overwrite" | "delete" | "load";
  } | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (isVisible) {
      loadCheckpoints();
    }
  }, [isVisible]);

  const [rotationAnimations] = useState<Record<number, Animated.Value>>({});
  const [heightAnimations] = useState<Record<number, Animated.Value>>({});

  const getRotationAnimation = (gameId: number) => {
    if (!rotationAnimations[gameId]) {
      rotationAnimations[gameId] = new Animated.Value(0);
    }
    return rotationAnimations[gameId];
  };

  const getHeightAnimation = (gameId: number) => {
    if (!heightAnimations[gameId]) {
      heightAnimations[gameId] = new Animated.Value(0);
    }
    return heightAnimations[gameId];
  };

  const toggleGameExpansion = (gameId: number) => {
    const isExpanding = !expandedGames[gameId];

    Animated.parallel([
      Animated.timing(getRotationAnimation(gameId), {
        toValue: isExpanding ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(getHeightAnimation(gameId), {
        toValue: isExpanding ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    setExpandedGames((prev) => ({ ...prev, [gameId]: isExpanding }));
  };

  const loadCheckpoints = async () => {
    const gamesList = await saveStore.getGamesList();
    const checkpointsByGame: Record<number, any[]> = {};

    for (const game of gamesList) {
      const gameCheckpoints = await saveStore.getCheckpointsListForGame(
        game.id,
      );
      checkpointsByGame[game.id] = gameCheckpoints.map((checkpoint) => ({
        ...checkpoint,
        player_data: parse(checkpoint.player_data),
      }));
    }

    setCheckpoints(checkpointsByGame);
  };

  const handleNewSave = async () => {
    await saveStore.createCheckpoint(false);
    loadCheckpoints();
  };

  const handleOverwrite = async (checkpointId: number) => {
    await saveStore.overwriteCheckpoint(checkpointId);
    setConfirmingAction(null);
    loadCheckpoints();
  };

  const handleDelete = async (checkpointId: number) => {
    await saveStore.deleteCheckpoint(checkpointId);
    setConfirmingAction(null);
    loadCheckpoints();
  };

  const handleLoad = async (checkpointId: number, gameId: number) => {
    const success = await saveStore.loadCheckpoint({
      gameId: gameId,
      checkpointId: checkpointId,
    });
    if (success) {
      wait(250).then(() => clearHistory(navigation));
    }
    setConfirmingAction(null);
  };

  const renderCheckpoint = ({
    item,
    gameId,
  }: {
    item: any;
    gameId: number;
  }) => (
    <View style={{ margin: 4 }}>
      <ThemedView style={[styles.ml4, styles.themedCard]}>
        <View>
          <Text>{saveStore.formatDate(new Date(item.timestamp))}</Text>
          <Text>{item.is_auto_save ? "Auto Save" : "Manual Save"}</Text>
          <Text>Player Age: {item.player_age}</Text>
        </View>
        <View style={{ ...styles.rowCenter, ...styles.mt2 }}>
          {confirmingAction && confirmingAction.id === item.id ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  if (confirmingAction.action === "overwrite") {
                    handleOverwrite(item.id);
                  } else if (confirmingAction.action === "delete") {
                    handleDelete(item.id);
                  } else if (confirmingAction.action === "load") {
                    handleLoad(item.id, gameId);
                  }
                }}
                style={{
                  ...styles.p2,
                  ...radius.md,
                  ...styles.mr2,
                  backgroundColor:
                    confirmingAction.action === "load"
                      ? "#22c55e"
                      : confirmingAction.action === "overwrite"
                      ? "#3b82f6"
                      : "#ef4444",
                }}
              >
                <Text style={{ color: "#fff" }}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setConfirmingAction(null)}
                style={{
                  backgroundColor: "#6b7280",
                  ...styles.p2,
                  ...radius.md,
                }}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() =>
                  setConfirmingAction({ id: item.id, action: "load" })
                }
                style={{
                  backgroundColor: "#22c55e",
                  ...styles.p2,
                  ...radius.md,
                  ...styles.mr2,
                }}
              >
                <Text style={{ color: "#fff" }}>Load</Text>
              </TouchableOpacity>
              {allowSaving && (
                <TouchableOpacity
                  onPress={() =>
                    setConfirmingAction({ id: item.id, action: "overwrite" })
                  }
                  style={{
                    backgroundColor: "#3b82f6",
                    ...styles.p2,
                    ...radius.md,
                    ...styles.mr2,
                  }}
                >
                  <Text style={{ color: "#fff" }}>Overwrite</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() =>
                  setConfirmingAction({ id: item.id, action: "delete" })
                }
                style={{
                  backgroundColor: "#ef4444",
                  ...styles.p2,
                  ...radius.md,
                }}
              >
                <Text style={{ color: "#fff" }}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ThemedView>
    </View>
  );

  const renderGame = ({ item: gameId }: { item: number }) => {
    const gameCheckpoints = checkpoints[gameId] || [];
    const latestCheckpoint = gameCheckpoints[0];

    if (!latestCheckpoint) return null;

    const rotateAnimation = getRotationAnimation(gameId);
    const heightAnimation = getHeightAnimation(gameId);

    const CHECKPOINT_HEIGHT = normalize(140);
    const PADDING = normalize(12);
    const calculatedHeight = CHECKPOINT_HEIGHT + PADDING;

    const spin = rotateAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    const maxHeight = heightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, calculatedHeight],
    });

    const getClassIcon = () => {
      const iconSize = 40;
      switch (latestCheckpoint.player_data.playerClass) {
        case "necromancer":
          return (
            <NecromancerSkull
              width={iconSize}
              height={iconSize}
              color={uiStore.colorScheme === "dark" ? "#9333ea" : "#6b21a8"}
            />
          );
        case "paladin":
          return <PaladinHammer width={iconSize} height={iconSize} />;
        case "mage":
          return (
            <WizardHat
              width={iconSize}
              height={iconSize}
              color={uiStore.colorScheme === "dark" ? "#2563eb" : "#1e40af"}
            />
          );
        default:
          return <RangerIcon width={iconSize} height={iconSize} />;
      }
    };

    return (
      <View style={[styles.pb4]}>
        <TouchableOpacity onPress={() => toggleGameExpansion(gameId)}>
          <ThemedCard>
            {playerState?.id === latestCheckpoint.player_data.id && (
              <Text
                style={[
                  styles["text-sm"],
                  { textAlign: "center", textDecorationLine: "underline" },
                ]}
              >
                Current Game
              </Text>
            )}
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bold}>
                  {`${latestCheckpoint.player_data.firstName} ${latestCheckpoint.player_data.lastName}`}
                </Text>
                <Text>
                  {toTitleCase(latestCheckpoint.player_data.playerClass)}
                </Text>
                <Text>
                  {
                    ElementToString[
                      latestCheckpoint.player_data.blessing as Element
                    ]
                  }
                </Text>
              </View>
              <View
                style={{
                  ...styles.columnBetween,
                  height: 96,
                }}
              >
                {getClassIcon()}
                <BlessingDisplay
                  blessing={latestCheckpoint.player_data.blessing}
                  colorScheme={uiStore.colorScheme}
                  size={40}
                />
              </View>
            </View>
            <Animated.View
              style={{
                ...styles.p2,
                position: "absolute",
                bottom: 0,
                transform: [{ rotate: spin }],
              }}
            >
              <Ionicons
                name="chevron-down"
                size={24}
                color={uiStore.colorScheme == "dark" ? "white" : "black"}
              />
            </Animated.View>
          </ThemedCard>
        </TouchableOpacity>
        <Animated.View
          style={{
            maxHeight,
            flexGrow: 1,
            alignItems: "center",
          }}
        >
          <FlatList
            horizontal
            data={gameCheckpoints}
            renderItem={({ item }) => renderCheckpoint({ item, gameId })}
            keyExtractor={(item) => item.id.toString()}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <Modal
      animationIn={uiStore.reduceMotion ? "fadeIn" : "slideInUp"}
      animationOut={uiStore.reduceMotion ? "fadeOut" : "slideOutDown"}
      animationInTiming={300}
      animationOutTiming={300}
      backdropTransitionOutTiming={300}
      backdropTransitionInTiming={300}
      backdropColor={
        Platform.OS == "ios"
          ? "#000000"
          : uiStore.colorScheme == "light"
          ? "#ffffffff"
          : "#000000"
      }
      isVisible={isVisible}
      backdropOpacity={0.5}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      statusBarTranslucent={true}
      coverScreen={true}
      deviceHeight={uiStore.dimensions.height}
      deviceWidth={uiStore.dimensions.width}
      style={{
        maxHeight: uiStore.dimensions.height * 0.75,
        marginVertical: "auto",
      }}
    >
      <ThemedView
        style={{
          width: "83.3333%",
          zIndex: 0,
          maxHeight: "90%",
          padding: "4%",
          ...styles.modalContent,
        }}
      >
        <View style={{ borderBottomWidth: 1, ...styles.rowBetween }}>
          <Text style={[styles["text-2xl"], styles.bold, styles.mb4]}>
            Saved Games
          </Text>
          {allowSaving && (
            <View style={[styles.rowBetween, styles.mb4]}>
              <TouchableOpacity
                onPress={handleNewSave}
                style={{
                  ...styles.p2,
                  ...radius.md,
                  backgroundColor: "#3b82f6",
                }}
              >
                <Text style={{ color: "#ffffff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <FlatList
          data={Object.keys(checkpoints).map(Number)}
          renderItem={renderGame}
          keyExtractor={(item) => item.toString()}
        />
      </ThemedView>
    </Modal>
  );
};

export default CheckpointModal;
