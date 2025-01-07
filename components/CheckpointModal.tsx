import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, FlatList, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRootStore } from "../hooks/stores";
import GenericModal from "./GenericModal";
import { Text } from "./Themed";
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
  const { saveStore, uiStore } = useRootStore();
  const [checkpoints, setCheckpoints] = useState<Record<number, any[]>>({});
  const [expandedGames, setExpandedGames] = useState<Record<number, boolean>>(
    {},
  );
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
    <View className="ml-4 mt-2">
      <View>
        <Text>{saveStore.formatDate(new Date(item.timestamp))}</Text>
        <Text>{item.is_auto_save ? "Auto Save" : "Manual Save"}</Text>
        <Text>Player Age: {item.player_age}</Text>
      </View>
      <View className="flex-row mt-2">
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
              className={`p-2 rounded mr-2 ${
                confirmingAction.action === "load"
                  ? "bg-green-500"
                  : confirmingAction.action === "overwrite"
                  ? "bg-blue-500"
                  : "bg-red-500"
              }`}
            >
              <Text className="text-white">Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmingAction(null)}
              className="bg-gray-500 p-2 rounded"
            >
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() =>
                setConfirmingAction({ id: item.id, action: "load" })
              }
              className="bg-green-500 p-2 rounded mr-2"
            >
              <Text className="text-white">Load</Text>
            </TouchableOpacity>
            {allowSaving && (
              <TouchableOpacity
                onPress={() =>
                  setConfirmingAction({ id: item.id, action: "overwrite" })
                }
                className="bg-blue-500 p-2 rounded mr-2"
              >
                <Text className="text-white">Overwrite</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                setConfirmingAction({ id: item.id, action: "delete" })
              }
              className="bg-red-500 p-2 rounded"
            >
              <Text className="text-white">Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderGame = ({ item: gameId }: { item: number }) => {
    const gameCheckpoints = checkpoints[gameId] || [];
    const latestCheckpoint = gameCheckpoints[0];

    if (!latestCheckpoint) return null;

    const rotateAnimation = getRotationAnimation(gameId);
    const heightAnimation = getHeightAnimation(gameId);

    const CHECKPOINT_HEIGHT = 120;
    const PADDING = 16;
    const calculatedHeight =
      gameCheckpoints.length * CHECKPOINT_HEIGHT + PADDING;

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
      <View className="mb-4">
        <TouchableOpacity onPress={() => toggleGameExpansion(gameId)}>
          <ThemedCard>
            <View className="flex flex-row justify-between">
              <View>
                <Text className="font-bold">
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
              <View className="flex justify-between h-24">
                {getClassIcon()}
                <BlessingDisplay
                  blessing={latestCheckpoint.player_data.blessing}
                  colorScheme={uiStore.colorScheme}
                  size={40}
                />
              </View>
            </View>
            <Animated.View
              className="absolute bottom-0 p-2"
              style={{ transform: [{ rotate: spin }] }}
            >
              <Ionicons
                name="chevron-down"
                size={24}
                color={uiStore.colorScheme == "dark" ? "white" : "black"}
              />
            </Animated.View>
          </ThemedCard>
        </TouchableOpacity>
        <Animated.View style={{ maxHeight, overflow: "hidden" }}>
          <FlatList
            data={gameCheckpoints}
            renderItem={({ item }) => renderCheckpoint({ item, gameId })}
            keyExtractor={(item) => item.id.toString()}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <GenericModal
      isVisibleCondition={isVisible}
      backFunction={onClose}
      isCheckPointModal={true}
      size={90}
      style={{
        maxHeight: uiStore.dimensions.height * 0.75,
        marginVertical: "auto",
      }}
    >
      <Text className="text-2xl font-bold mb-4">Saved Games</Text>
      {allowSaving && (
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={handleNewSave}
            className="bg-blue-500 p-2 rounded"
          >
            <Text className="text-white">Save</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={Object.keys(checkpoints).map(Number)}
        renderItem={renderGame}
        keyExtractor={(item) => item.toString()}
      />
    </GenericModal>
  );
};

export default CheckpointModal;
