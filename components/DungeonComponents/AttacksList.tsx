import React, { useMemo, useCallback } from "react";
import { View, FlatList, Pressable } from "react-native";
import { observer } from "mobx-react-lite";
import { useRootStore, usePlayerStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { Attack } from "@/entities/attack";
import { useCombatActions } from "@/hooks/combat";
import { Text, ThemedView } from "../Themed";
import { Energy, Regen } from "@/assets/icons/SVGIcons";
import GenericRaisedButton from "../GenericRaisedButton";
import { toTitleCase } from "@/utility/functions/misc";
import { elementalColorMap } from "@/constants/Colors";

const AttacksList = observer(
  ({
    setAttackDetails,
    attackHandler,
    vibration,
  }: {
    setAttackDetails: (attack: Attack) => void;
    attackHandler: (attack: Attack) => void;
    vibration: ({
      style,
      essential,
    }: {
      style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
      essential?: boolean;
    }) => void;
  }) => {
    const { uiStore } = useRootStore();
    const playerState = usePlayerStore();
    const { pass } = useCombatActions();

    // Combine the weapon attacks and spells into one array.
    const attacks = useMemo(
      () => [...playerState.weaponAttacks, ...playerState.spells],
      [playerState.weaponAttacks, playerState.spells],
    );

    const data = useMemo(() => [{ type: "pass" }, ...attacks], [attacks]);

    const handlePassPress = useCallback(() => {
      vibration({ style: "light" });
      pass({ voluntary: true });
    }, [vibration, uiStore]);

    const styles = useStyles();

    return (
      <FlatList
        key={uiStore.isLandscape ? "landscape" : "portrait"}
        data={data}
        inverted
        indicatorStyle="white"
        persistentScrollbar
        contentContainerStyle={[
          styles.notchAvoidingLanscapePad,
          { paddingHorizontal: "2%" },
        ]}
        numColumns={uiStore.isLandscape ? 2 : 1}
        keyExtractor={(item, index) =>
          item instanceof Attack ? `${item.name}-${index}` : `pass-${index}`
        }
        renderItem={({ item, index }) => {
          if (item instanceof Attack) {
            return (
              <AttackItem
                attack={item}
                setAttackDetails={setAttackDetails}
                attackHandler={attackHandler}
                setWidthToFull={
                  index === data.length - 1 &&
                  uiStore.isLandscape &&
                  data.length % 2 !== 0
                }
              />
            );
          } else {
            return <PassButton onPress={handlePassPress} />;
          }
        }}
      />
    );
  },
);

export default AttacksList;

const AttackItem = observer(
  ({
    attack,
    attackHandler,
    setAttackDetails,
    setWidthToFull,
  }: {
    attack: Attack;
    setAttackDetails: (val: Attack) => void;
    attackHandler: (val: Attack) => void;
    setWidthToFull: boolean;
  }) => {
    const { playerState, enemyStore, uiStore } = useRootStore();
    const styles = useStyles();

    if (!playerState) {
      throw new Error(
        "playerState should be checked before AttackOrSpellItem render",
      );
    }

    const canUse = useMemo(
      () => attack.canBeUsed,
      [attack, playerState.currentMana, playerState.isStunned],
    );

    const isDisabled = useMemo(
      () => !canUse.val || enemyStore.enemyTurnOngoing,
      [canUse, enemyStore.enemyTurnOngoing],
    );

    const handlePress = useCallback(() => {
      attackHandler(attack);
    }, [attackHandler, attack]);

    const handleDetailsPress = useCallback(() => {
      setAttackDetails(attack);
    }, [setAttackDetails, attack]);

    const isSpell = !!attack.element;

    const buttonText = useMemo(() => {
      if (playerState.isStunned) return "Stunned!";
      if (isSpell) return canUse.val ? "Cast" : canUse.reason;
      return "Attack";
    }, [isSpell, canUse, playerState.isStunned]);

    const backgroundColor = useMemo(() => {
      if (isSpell) return elementalColorMap[attack.element].dark;
      return uiStore.colorScheme === "light" ? "#d4d4d8" : "#27272a";
    }, [isSpell, attack, uiStore.colorScheme]);

    const textColor = useMemo(() => {
      if (isSpell) return elementalColorMap[attack.element].dark;
      return uiStore.colorScheme === "dark" ? "#fafafa" : "#09090b";
    }, [isSpell, attack, uiStore.colorScheme]);

    return (
      <>
        <View
          style={[
            styles.attackCardBase,
            isSpell && {
              backgroundColor: elementalColorMap[attack.element].light,
            },
            setWidthToFull && { width: "100%" },
          ]}
        >
          <View style={styles.columnCenter}>
            <Pressable onPress={handleDetailsPress}>
              <Text style={[styles["text-xl"], { color: textColor }]}>
                {toTitleCase(attack.name)}
              </Text>
              {!isSpell && attack.baseHitChance ? (
                <Text style={styles["text-lg"]}>{`${
                  attack.baseHitChance * 100
                }% hit chance`}</Text>
              ) : (
                isSpell && (
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        color: elementalColorMap[attack.element].dark,
                      }}
                    >
                      {attack.manaCost}
                    </Text>
                    <View style={{ marginVertical: "auto", paddingLeft: 4 }}>
                      <Energy
                        height={uiStore.iconSizeSmall}
                        width={uiStore.iconSizeSmall}
                        color={
                          uiStore.colorScheme === "dark" ? "#2563eb" : undefined
                        }
                      />
                    </View>
                  </View>
                )
              )}
            </Pressable>
          </View>
          <GenericRaisedButton
            disabled={isDisabled}
            onPress={handlePress}
            backgroundColor={backgroundColor}
            disableTopLevelStyling
            style={{ opacity: isDisabled ? 0.5 : 1 }}
            buttonStyle={styles.actionButton}
          >
            <Text style={styles["text-xl"]}>{buttonText}</Text>
          </GenericRaisedButton>
        </View>
      </>
    );
  },
);

const PassButton = observer(({ onPress }: { onPress: () => void }) => {
  const { uiStore, enemyStore } = useRootStore();
  const styles = useStyles();

  return (
    <ThemedView style={styles.attackCardBase}>
      <View style={styles.columnCenter}>
        <Text style={styles["text-xl"]}>Pass</Text>
        <View style={styles.rowItemsCenter}>
          <Text>1.5x</Text>
          <Regen width={uiStore.iconSizeSmall} height={uiStore.iconSizeSmall} />
        </View>
      </View>
      <GenericRaisedButton
        disabled={enemyStore.enemyTurnOngoing}
        disableTopLevelStyling
        onPress={onPress}
        backgroundColor={uiStore.colorScheme == "light" ? "#d4d4d8" : "#27272a"}
        style={{ opacity: enemyStore.enemyTurnOngoing ? 0.5 : 1 }}
        buttonStyle={styles.actionButton}
      >
        <Text style={styles["text-xl"]}>Use</Text>
      </GenericRaisedButton>
    </ThemedView>
  );
});
