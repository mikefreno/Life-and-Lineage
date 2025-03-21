import GenericModal from "@/components/GenericModal";
import { useRootStore } from "@/hooks/stores";
import { normalize, useStyles } from "@/hooks/styles";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/Themed";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Coins, RotateArrow } from "@/assets/icons/SVGIcons";
import { useVibration } from "@/hooks/generic";
import {
  DetailedViewConditionRender,
  DetailedViewDebilitationsRender,
  RenderPrimaryStatsBlock,
  RenderSecondaryStatsBlock,
  StatCategory,
} from "@/components/PlayerStatus/Components";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { Attribute, Modifier } from "@/utility/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFENSIVE_STATS, OFFENSIVE_STATS } from "@/utility/functions/stats";
import { observer } from "mobx-react-lite";
import BlessingDisplay from "@/components/BlessingsDisplay";
import React from "react";
import ClassDisplay from "@/components/ClassDisplay";
import { toTitleCase } from "@/utility/functions/misc";
import { playerClassColors } from "@/constants/Colors";

export const PlayerStatusModal = observer(() => {
  const { uiStore, playerState } = useRootStore();
  const styles = useStyles();
  const vibration = useVibration();

  const [ownedOffensive, setOwnedOffensive] = useState<Map<Modifier, number>>(
    new Map(),
  );
  const [ownedDefensive, setOwnedDefensive] = useState<Map<Modifier, number>>(
    new Map(),
  );

  const [respeccing, setRespeccing] = useState<boolean>(false);

  const prevEquipmentRef = useRef<string>("");
  const respeccingShared = useSharedValue(false);
  const pressed = useSharedValue(false);

  const respecButtonRotate = useSharedValue(0);

  useEffect(() => {
    respecButtonRotate.value = withTiming(respeccing ? 180 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [respeccing]);

  useEffect(() => {
    if (playerState?.totalAllocatedPoints == 0) {
      setRespeccing(false);
    }
  }, [playerState?.unAllocatedSkillPoints]);
  useEffect(() => {
    respeccingShared.value = respeccing;
  }, [respeccing]);

  const respecButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(pressed.value ? 0.9 : 1) },
        { rotateY: `${respecButtonRotate.value}deg` },
      ],
      backgroundColor: respeccingShared.value ? "#16a34a" : "#dc2626",
    };
  });

  const ClassNode = useMemo(() => {
    const iconSize = uiStore.dimensions.lesser / 10;

    if (playerState) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ alignSelf: "center", flexDirection: "row" }}>
            <ClassDisplay
              colorScheme={uiStore.colorScheme}
              playerClass={playerState?.playerClass}
              size={iconSize}
            />
            <View
              style={{
                width: normalize(20),
                height: iconSize,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 0,
              }}
            >
              <View
                style={{
                  width: normalize(4),
                  borderRadius: 5,
                  height: iconSize * 1.2,
                  backgroundColor:
                    uiStore.colorScheme === "dark" ? "#ffffff50" : "#00000050",
                  transform: [{ rotate: "20deg" }],
                }}
              />
            </View>
            <BlessingDisplay
              blessing={playerState.blessing}
              colorScheme={uiStore.colorScheme}
              size={iconSize}
            />
          </View>
          <Text
            style={{
              textAlign: "center",
              color: playerClassColors[playerState.playerClass],
            }}
          >
            {toTitleCase(playerState.playerClass)}
          </Text>
        </View>
      );
    } else {
      return <></>;
    }
  }, [
    playerState?.playerClass,
    uiStore.dimensions.height,
    uiStore.colorScheme,
  ]);

  useEffect(() => {
    if (!playerState?.equipmentStats) return;

    const currentEquipment = JSON.stringify(
      Array.from(playerState.equipmentStats.entries()),
    );
    if (currentEquipment === prevEquipmentRef.current) return;

    prevEquipmentRef.current = currentEquipment;

    const offensive = new Map(
      Array.from(playerState.equipmentStats.entries()).filter(
        ([key, value]) => OFFENSIVE_STATS.includes(key) && value > 0,
      ),
    );

    const defensive = new Map(
      Array.from(playerState.equipmentStats.entries()).filter(
        ([key, value]) => DEFENSIVE_STATS.includes(key) && value > 0,
      ),
    );

    setOwnedOffensive(offensive);
    setOwnedDefensive(defensive);
  }, [playerState?.equipmentStats]);

  if (!playerState) return;

  return (
    <GenericModal
      isVisibleCondition={uiStore.detailedStatusViewShowing}
      backFunction={() => uiStore.setDetailedStatusViewShowing(false)}
      scrollEnabled={
        uiStore.dimensions.height < 500 || playerState.debilitations.length > 0
      }
      size={100}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            alignItems: "center",
            paddingVertical: 4,
            width: "100%",
            ...styles.rowBetween,
          }}
        >
          {ClassNode}
          <View style={[styles.columnCenter, { flex: 1 }]}>
            <Text style={[styles["text-xl"], { textAlign: "center" }]}>
              {playerState.fullName}
            </Text>
            <Text style={{ textAlign: "center" }}>{playerState.job}</Text>
          </View>
          <View style={[styles.columnCenter, { flex: 1 }]}>
            <View style={{ marginLeft: -16, flexDirection: "row" }}>
              <Text>{playerState.readableGold}</Text>
              <Coins
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
          </View>
        </View>
        {playerState.unAllocatedSkillPoints > 0 && (
          <Text
            style={{
              color: "#16a34a",
              textAlign: "center",
              ...styles["text-xl"],
            }}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
          >
            {playerState.unAllocatedSkillPoints} unallocated skill points
          </Text>
        )}
        {playerState.totalAllocatedPoints > 0 && (
          <View
            style={{
              position: "absolute",
              right: 0,
              marginTop: 0,
            }}
          >
            <Pressable
              disabled={playerState.root.dungeonStore.inCombat}
              onPress={() => {
                setRespeccing(!respeccing);
                vibration({ style: "light", essential: true });
              }}
            >
              <Animated.View style={[styles.respecButton, respecButtonStyle]}>
                <View style={{ marginVertical: "auto" }}>
                  <RotateArrow
                    height={uiStore.iconSizeSmall}
                    width={uiStore.iconSizeSmall}
                    color={"white"}
                  />
                </View>
              </Animated.View>
            </Pressable>
          </View>
        )}
        <RenderPrimaryStatsBlock
          stat={Attribute.health}
          playerState={playerState}
          respeccing={respeccing}
          vibration={vibration}
        />
        <RenderPrimaryStatsBlock
          stat={Attribute.mana}
          playerState={playerState}
          respeccing={respeccing}
          vibration={vibration}
        />
        <RenderPrimaryStatsBlock
          stat={Attribute.sanity}
          playerState={playerState}
          respeccing={respeccing}
          vibration={vibration}
        />
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
          <RenderSecondaryStatsBlock
            stat={Attribute.strength}
            playerState={playerState}
            respeccing={respeccing}
            vibration={vibration}
          />
          <RenderSecondaryStatsBlock
            stat={Attribute.dexterity}
            playerState={playerState}
            respeccing={respeccing}
            vibration={vibration}
          />
          <RenderSecondaryStatsBlock
            stat={Attribute.intelligence}
            playerState={playerState}
            respeccing={respeccing}
            vibration={vibration}
          />
          <RenderSecondaryStatsBlock
            stat={Attribute.manaRegen}
            playerState={playerState}
            respeccing={respeccing}
            vibration={vibration}
          />
        </ScrollView>
        {playerState.equipmentStats!.size > 0 ? (
          <View style={{ paddingVertical: 4 }}>
            <GenericStrikeAround>Equipment Stats</GenericStrikeAround>
            <View
              style={{
                flexDirection: "row",
                marginTop: 8,
                height: Math.max(
                  Math.min(
                    uiStore.dimensions.height * 0.35,
                    Math.max(ownedOffensive.size, ownedDefensive.size) * 70 +
                      normalize(34),
                    uiStore.dimensions.height * 0.2,
                  ),
                ),
              }}
            >
              <View style={styles.equipmentStatsSection}>
                <Text style={[{ textAlign: "center", marginBottom: 4 }]}>
                  Offensive
                </Text>
                <StatCategory stats={ownedOffensive} category={"offensive"} />
              </View>
              <View style={styles.equipmentStatsSection}>
                <Text style={{ textAlign: "center", marginBottom: 4 }}>
                  Defensive
                </Text>
                <StatCategory stats={ownedDefensive} category={"defensive"} />
              </View>
            </View>
          </View>
        ) : null}
        {playerState.conditions.length > 0 ? (
          <View>
            <GenericStrikeAround>Conditions</GenericStrikeAround>
            <DetailedViewConditionRender />
          </View>
        ) : null}
        {playerState.debilitations.length > 0 ? (
          <View>
            <GenericStrikeAround
              style={{ textAlign: "center" }}
            >{`Debilitations\n(due to old age)`}</GenericStrikeAround>
            <DetailedViewDebilitationsRender />
          </View>
        ) : null}
      </View>
    </GenericModal>
  );
});
