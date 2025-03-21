import { Text } from "@/components/Themed";
import { Pressable, View } from "react-native";
import { useNavigation } from "expo-router";
import clearHistory, { toTitleCase, wait } from "@/utility/functions/misc";
import {
  createPlayerCharacter,
  getStartingBaseStats,
} from "@/utility/functions/characterAid";
import { Element, ElementToString } from "@/utility/types";
import { elementalColorMap, playerClassColors } from "@/constants/Colors";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useNewGameStore } from "@/app/NewGame/_layout";
import { tw_base, useStyles } from "@/hooks/styles";
import {
  DexterityIcon,
  Energy,
  HealthIcon,
  IntelligenceIcon,
  Regen,
  Sanity,
  SquareMinus,
  SquarePlus,
  StrengthIcon,
} from "@/assets/icons/SVGIcons";
import { useState } from "react";
import NewGameMetaControls from "@/components/NewGameMetaControls";
import React from "react";

export default function NewGameReview() {
  const { firstName, lastName, blessingSelection, sex, classSelection } =
    useNewGameStore();

  const vibration = useVibration();

  let root = useRootStore();
  const styles = useStyles();
  const navigation = useNavigation();
  const { uiStore } = useRootStore();
  const [allocatedStats, setAllocatedStats] = useState<BaseStats | null>(null);
  const [remainingPoints, setRemainingPoints] = useState<number>(3);
  const baseStats = getStartingBaseStats({ classSelection });

  async function startGame() {
    if (
      classSelection &&
      sex &&
      blessingSelection !== undefined &&
      allocatedStats
    ) {
      const player = createPlayerCharacter({
        sex,
        root,
        firstName,
        lastName,
        blessingSelection,
        classSelection,
        allocatedStats,
      });

      await root.newGame(player);
      vibration({ style: "success" });
      wait(250).then(() => clearHistory(navigation));
    }
  }

  const handleStatsAllocated = (stats: BaseStats, remaining: number) => {
    setAllocatedStats(stats);
    setRemainingPoints(remaining);
  };

  if (blessingSelection !== undefined && classSelection !== undefined) {
    return (
      <>
        <View style={styles.newGameContainer}>
          <Text style={styles.newGameHeader}>
            {`${firstName} ${lastName} the `}
            <Text
              style={[
                styles["text-2xl"],
                {
                  color:
                    blessingSelection == Element.assassination &&
                    uiStore.colorScheme == "dark"
                      ? elementalColorMap[blessingSelection].light
                      : elementalColorMap[blessingSelection].dark,
                },
              ]}
            >{`${ElementToString[blessingSelection]}`}</Text>
            -born{" "}
            <Text
              style={[
                styles["text-2xl"],
                { color: playerClassColors[classSelection] },
              ]}
            >{`${toTitleCase(classSelection)}`}</Text>
          </Text>
          <StatAllocation
            baseStats={baseStats}
            onStatsAllocated={handleStatsAllocated}
          />
          <GenericFlatButton
            onPress={startGame}
            style={{ marginTop: tw_base[4] }}
            accessibilityRole="button"
            accessibilityLabel="Confirm"
            disabled={!allocatedStats || remainingPoints > 0}
            childrenWhenDisabled={"Spend all points to continue"}
          >
            Confirm?
          </GenericFlatButton>
        </View>
        <NewGameMetaControls />
      </>
    );
  }
}

type BaseStats = ReturnType<typeof getStartingBaseStats>;
type StatKey = keyof BaseStats;

interface StatAllocationProps {
  baseStats: BaseStats;
  onStatsAllocated: (stats: BaseStats, remainingPoints: number) => void;
}

// Type for stat increments/decrements
type StatIncrements = {
  [K in StatKey]: number;
};

const statIncrements: StatIncrements = {
  baseHealth: 10,
  baseMana: 10,
  baseSanity: 5,
  baseStrength: 1,
  baseIntelligence: 1,
  baseDexterity: 1,
  baseManaRegen: 1,
};

export function StatAllocation({
  baseStats,
  onStatsAllocated,
}: StatAllocationProps) {
  const [remainingPoints, setRemainingPoints] = useState(3);
  const [stats, setStats] = useState<BaseStats>(baseStats);
  const styles = useStyles();
  const vibration = useVibration();
  const { uiStore } = useRootStore();

  const handleIncrement = (stat: StatKey) => {
    if (remainingPoints <= 0) return;

    const increment = statIncrements[stat];

    const newStats = {
      ...stats,
      [stat]: stats[stat] + increment,
    };
    setStats(newStats);
    setRemainingPoints((prev) => prev - 1);
    onStatsAllocated(newStats, remainingPoints - 1);
  };

  const handleDecrement = (stat: StatKey) => {
    if (stats[stat] <= baseStats[stat]) return;

    const decrement = statIncrements[stat];

    const newStats = {
      ...stats,
      [stat]: stats[stat] - decrement,
    };
    setStats(newStats);
    setRemainingPoints((prev) => prev + 1);
    onStatsAllocated(newStats, remainingPoints + 1);
  };

  interface StatRowProps {
    stat: StatKey;
    icon: JSX.Element;
    name: string;
    value: number;
  }

  const StatRow = ({ stat, icon, value, name }: StatRowProps) => (
    <View style={styles.statRow}>
      <View style={styles.rowItemsCenter}>
        {icon}
        <Text style={[{ marginHorizontal: 4 }, styles["text-md"]]}>
          {value}
          {stats[stat] !== baseStats[stat]
            ? `(+${stats[stat] - baseStats[stat]})`
            : ""}
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
        }}
      >
        <Text style={[styles["text-sm"], { textAlign: "center" }]}>
          ({name})
        </Text>
      </View>
      <View style={[styles.rowItemsCenter, { gap: 16 }]}>
        <Pressable
          onPress={() => {
            vibration({ style: "light", essential: true });
            handleDecrement(stat);
          }}
          style={{ zIndex: 999 }}
          disabled={stats[stat] <= baseStats[stat]}
        >
          <SquareMinus
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
            opacity={stats[stat] <= baseStats[stat] ? 0.2 : 1}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            vibration({ style: "light", essential: true });
            handleIncrement(stat);
          }}
          style={{ zIndex: 999 }}
          disabled={remainingPoints <= 0}
        >
          <SquarePlus
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
            opacity={remainingPoints <= 0 ? 0.2 : 1}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.gearStatsContainer, { paddingHorizontal: 16 }]}>
      <Text
        style={[
          styles["text-lg"],
          { color: "#ef4444", textAlign: "center", marginBottom: 16 },
        ]}
      >
        These stat allocations are permanent and cannot be changed later.
      </Text>

      <Text
        style={[styles["text-xl"], styles.textCenter, { marginBottom: 16 }]}
      >
        Remaining Points: {remainingPoints}
      </Text>

      <StatRow
        stat="baseHealth"
        name="Health"
        icon={
          <HealthIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        }
        value={stats.baseHealth}
      />
      <StatRow
        stat="baseMana"
        name="Mana"
        icon={
          <Energy
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        }
        value={stats.baseMana}
      />
      <StatRow
        stat="baseSanity"
        name="Sanity"
        icon={
          <Sanity
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        }
        value={stats.baseSanity}
      />
      <StatRow
        stat="baseStrength"
        name="Strength"
        icon={
          <StrengthIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        }
        value={stats.baseStrength}
      />
      <StatRow
        stat="baseIntelligence"
        name="Intelligence"
        icon={
          <IntelligenceIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        }
        value={stats.baseIntelligence}
      />
      <StatRow
        stat="baseDexterity"
        name="Dexterity"
        icon={
          <DexterityIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        }
        value={stats.baseDexterity}
      />
      <StatRow
        stat="baseManaRegen"
        name="Mana Regen"
        icon={
          <Regen height={uiStore.iconSizeLarge} width={uiStore.iconSizeLarge} />
        }
        value={stats.baseManaRegen}
      />
    </View>
  );
}
