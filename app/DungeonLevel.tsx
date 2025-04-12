import React from "react";
import { type LayoutChangeEvent, View, Animated } from "react-native";
import { useRef, useEffect, useState, useCallback } from "react";
import { Pressable } from "react-native";
import BattleTab from "@/components/DungeonComponents/BattleTab";
import { observer } from "mobx-react-lite";
import TutorialModal from "@/components/TutorialModal";
import GenericModal from "@/components/GenericModal";
import BattleTabControls from "@/components/DungeonComponents/BattleTabControls";
import TargetSelection from "@/components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "@/components/DungeonComponents/DroppedItemsModal";
import LeftBehindItemsModal from "@/components/DungeonComponents/LeftBehindItemsModal";
import { SackIcon } from "@/assets/icons/SVGIcons";
import { TutorialOption } from "@/utility/types";
import { useIsFocused } from "@react-navigation/native";
import { useCombatState, useLootState } from "@/providers/DungeonData";
import DungeonEnemyDisplay from "@/components/DungeonComponents/DungeonEnemyDisplay";
import { DungeonMapRender } from "@/components/DungeonComponents/DungeonMap";
import { StatsDisplay } from "@/components/StatsDisplay";
import { useDraggableStore, useRootStore } from "@/hooks/stores";
import { usePouch } from "@/hooks/generic";
import D20DieAnimation from "@/components/DieRollAnim";
import { LinearGradientBlur } from "@/components/LinearGradientBlur";
import { Parallax } from "@/components/DungeonComponents/Parallax";
import { Image } from "expo-image";
import { useStyles } from "@/hooks/styles";
import { reaction } from "mobx";
import { ScreenShaker } from "@/components/ScreenShaker";
import { VFXWrapper } from "@/components/VFXWrapper";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { PLAYER_TEXT_STRING_DURATION } from "@/stores/PlayerAnimationStore";
import Colors from "@/constants/Colors";
import { useScaling } from "@/hooks/scaling";
import { SCREEN_TRANSITION_TIMING } from "@/stores/UIStore";

const DungeonLevelScreen = observer(() => {
  const { dungeonStore, uiStore, audioStore, playerAnimationStore } =
    useRootStore();
  const { currentLevel, inCombat } = dungeonStore;
  const { draggableClassStore } = useDraggableStore();

  const { setInventoryFullNotifier, displayItem, setDisplayItem } =
    useLootState();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { addItemToPouch } = usePouch();
  const colorScheme = uiStore.colorScheme;
  const { getNormalizedSize, getNormalizedFontSize } = useScaling();

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log" | "minions"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const isFocused = useIsFocused();
  const styles = useStyles();

  const pouchRef = useRef<View>(null);

  const setPouchBoundsOnLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setTimeout(() => {
        if (pouchRef.current) {
          pouchRef.current.measure((x, y, w, h, pageX, pageY) => {
            draggableClassStore.setAncillaryBounds("pouch", {
              x: pageX,
              y: pageY,
              width,
              height,
            });
          });
        }
      }, 100);
    },
    [uiStore.dimensions],
  );

  useEffect(() => {
    if (colorScheme != "dark") {
      uiStore.dungeonSetter();
    }
    if (
      dungeonStore.currentInstance?.name.toLowerCase() == "training grounds" ||
      dungeonStore.currentLevel?.isActivity
    ) {
      dungeonStore.setEncounter(false);
      dungeonStore.setInCombat(true);
      uiStore.incrementLoadingStep();
    }

    new Promise<void>((resolve) => {
      if (dungeonStore.currentMap && dungeonStore.currentPosition) {
        resolve();
        uiStore.incrementLoadingStep();
      } else {
        const disposer = reaction(
          () => ({
            map: dungeonStore.currentMap,
            position: dungeonStore.currentPosition,
          }),
          ({ map, position }) => {
            if (map && position) {
              disposer();
              resolve();
              uiStore.incrementLoadingStep();
            }
          },
        );
      }
    }).catch((error) => {
      uiStore.completeLoading();
    });
    return () => draggableClassStore.removeAncillaryBounds("pouch");
  }, []);

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  const textOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (playerAnimationStore.textString) {
      textOpacity.setValue(1);

      Animated.timing(textOpacity, {
        toValue: 0,
        duration: PLAYER_TEXT_STRING_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [playerAnimationStore.textString]);

  if (currentLevel) {
    return (
      <ScreenShaker>
        <TutorialModal
          tutorial={TutorialOption.dungeonInterior}
          isFocused={
            isFocused &&
            dungeonStore.currentInstance?.name.toLowerCase() !==
              "training grounds"
          }
          pageOne={{
            title: "Watch Your Health",
            body: "Your situation can change rapidly.",
          }}
          pageTwo={{
            title: "Advance by killing the boss.",
            body: "Navigate the dungeon until you find them.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <DroppedItemsModal />
        <LeftBehindItemsModal
          showLeftBehindItemsScreen={showLeftBehindItemsScreen}
          setShowLeftBehindItemsScreen={setShowLeftBehindItemsScreen}
        />
        <GenericModal
          isVisibleCondition={showTargetSelection.showing}
          size={100}
          backFunction={() => {
            setShowTargetSelection({
              showing: false,
              chosenAttack: null,
            });
          }}
          scrollEnabled={true}
        >
          <TargetSelection />
        </GenericModal>
        <View
          style={{
            marginTop: uiStore.headerHeight + 16,
            position: "absolute",
            marginLeft: 16,
            zIndex: 9999,
          }}
        >
          <Pressable
            ref={pouchRef}
            onLayout={(e) => setPouchBoundsOnLayout(e)}
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon
              height={getNormalizedSize(32)}
              width={getNormalizedSize(32)}
            />
          </Pressable>
        </View>
        <Parallax
          backgroundName={
            currentLevel.parallaxOverride ?? currentLevel.parent.bgName
          }
          inCombat={inCombat}
          playerPosition={{
            x: dungeonStore.currentPosition?.x ?? 0,
            y: dungeonStore.currentPosition?.y ?? 0,
          }}
          boundingBox={dungeonStore.currentMapDimensions!}
          reduceMotion={uiStore.reduceMotion}
        >
          <View style={{ flex: 1 }}>
            {dungeonStore.currentSpecialEncounter ? (
              <Pressable
                style={styles.dungeonSpecialEncounter}
                onPress={() => setDisplayItem(null)}
              >
                <Image
                  source={dungeonStore.currentSpecialEncounter.imageSource}
                  style={{
                    width: uiStore.dimensions.lesser * 0.5,
                    height: uiStore.dimensions.lesser * 0.5,
                    marginVertical: "auto",
                  }}
                  contentFit="contain"
                />
              </Pressable>
            ) : inCombat ? (
              <Pressable
                onPress={() => setDisplayItem(null)}
                style={{
                  flex: 1,
                  height: "40%",
                  ...styles.notchMirroredLanscapePad,
                }}
              >
                <VFXWrapper headerHeight={uiStore.headerHeight}>
                  <DungeonEnemyDisplay />
                </VFXWrapper>
              </Pressable>
            ) : (
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setDisplayItem(null)}
              >
                <DungeonMapRender />
              </Pressable>
            )}
            <LinearGradientBlur style={styles.dungeonBlur} />
            <View
              style={{
                flex: 1,
                paddingBottom: uiStore.playerStatusHeightSecondary,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: uiStore.dimensions.width,
                  marginTop: -getNormalizedFontSize(30),
                }}
              >
                <Animated.Text
                  style={{
                    textAlign: "center",
                    ...styles["text-2xl"],
                    color: Colors.dark.text,
                    opacity: textOpacity,
                    fontFamily: "PixelifySans",
                  }}
                >
                  {playerAnimationStore.textString}
                </Animated.Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: uiStore.isLandscape ? "row" : "column",
                  ...styles.notchAvoidingLanscapePad,
                }}
              >
                <BattleTab battleTab={battleTab} />
                <BattleTabControls
                  battleTab={battleTab}
                  setBattleTab={setBattleTab}
                />
              </View>
            </View>
            <PlayerStatusForSecondary />
          </View>
        </Parallax>
        {displayItem && (
          <View
            style={{
              position: "absolute",
              zIndex: 10,
            }}
            pointerEvents="box-none"
          >
            <StatsDisplay
              displayItem={displayItem}
              clearItem={() => setDisplayItem(null)}
              addItemToPouch={(items) => addItemToPouch({ items })}
              topOffset={-96}
            />
          </View>
        )}
      </ScreenShaker>
    );
  } else {
    return (
      <View style={styles.loadingContainer}>
        <D20DieAnimation keepRolling={true} />
      </View>
    );
  }
});

export default DungeonLevelScreen;
