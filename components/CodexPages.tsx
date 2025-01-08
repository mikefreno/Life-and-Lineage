import { ScrollView, View } from "react-native";
import { Text } from "./Themed";
import {
  Air,
  ArcaneIcon,
  AssassinationIcon,
  BeastMasteryIcon,
  BloodDrop,
  Bones,
  Earth,
  Fire,
  Holy,
  NecromancerSkull,
  PaladinHammer,
  Pestilence,
  Protection,
  RangerIcon,
  SummonerSkull,
  Vengeance,
  Water,
  WizardHat,
} from "../assets/icons/SVGIcons";
import { Link } from "expo-router";
import { GenericCarousel } from "./GenericCarousel";
import GenericStrikeAround from "./GenericStrikeAround";
import { useRootStore } from "../hooks/stores";
import { useStyles } from "../hooks/styles";

export function CombatCodex() {
  const images = [
    require("../assets/images/codex/DungeonAttacks.png"),
    require("../assets/images/codex/DungeonEquipment.png"),
    require("../assets/images/codex/DungeonLog.png"),
  ];

  return (
    <View>
      <GenericCarousel images={images} />
    </View>
  );
}

export function DungeonCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}

export function GearCodex() {
  return (
    <View>
      <View>
        <Text>
          At it's core, gear(equipable items) is the culmination of 3 factors;
          bases (which are the specific item variant), rarity ('Normal', 'Magic'
          or 'Rare') and affixes(explained in detail later).
        </Text>
      </View>
      <View>
        <GenericStrikeAround>Bases</GenericStrikeAround>
        <Text>
          Bases are the essentially the state of the item if it is 'Normal',
          these will have some basic stats like damage for weapons and armor for
          armor. They will also determine the stat requirements for the item.
        </Text>
      </View>
      <View>
        <GenericStrikeAround>Rarity</GenericStrikeAround>
        <Text>
          'Rarity' can be 'Normal', 'Magic' or 'Rare'. 'Magic' items have one
          affix, this can be either a 'Prefix' or 'Suffix'. 'Rare' items have
          both a 'Prefix' and 'Suffix'.
        </Text>
      </View>
      <View>
        <GenericStrikeAround>Affixes</GenericStrikeAround>
        <Text>
          'Affixes' are of two variants, 'Prefix' or 'Suffix'. Prefixes add
          attribute or defensive modifiers to items and Suffixes add offensive
          modifiers.
        </Text>
      </View>
    </View>
  );
}

export function LaborCodex() {
  const styles = useStyles();
  const images = [
    require("../assets/images/codex/Labors.jpeg"),
    require("../assets/images/codex/LaborsRejection.jpeg"),
    require("../assets/images/codex/QualificationsButton.jpeg"),
    require("../assets/images/codex/Qualifications.jpeg"),
  ];
  return (
    <ScrollView>
      <Text style={[styles.xl, styles.textCenter, styles.px2]}>
        Labors are a way to earn gold in a (mostly) safe way.
      </Text>
      <GenericCarousel images={images} />
      <Text style={[styles.xl, styles.textCenter, styles.px2]}>
        There are a number of jobs you can take, some require no qualifications,
        but most have some.
      </Text>
      <Text style={[styles.xl, styles.textCenter, styles.p2]}>
        To gain new qualifications, go to the qualifications page, just keep an
        eye on your sanity.
      </Text>
    </ScrollView>
  );
}

export function MagicCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}

export function PlayerCodex() {
  const { uiStore } = useRootStore();
  const styles = useStyles();

  return (
    <ScrollView>
      <View style={styles.p4}>
        <View>
          <Text style={{ ...styles.xl, ...styles.textCenter }}>
            The player(you) has 4 potential classes:{"\n"}
          </Text>
          <View style={styles.mxAuto}>
            <Link href="/Options/Codex/Player/Mage" suppressHighlighting>
              <Text
                style={{
                  ...styles.xl,
                  textDecorationLine: "underline",
                  color: uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af",
                }}
              >
                The Mage{" "}
                <WizardHat
                  height={24}
                  width={24}
                  color={uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                />
              </Text>
            </Link>
          </View>
          <View style={styles.mxAuto}>
            <Link href="/Options/Codex/Player/Necromancer" suppressHighlighting>
              <Text
                style={{
                  ...styles.xl,
                  textDecorationLine: "underline",
                  color: uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8",
                }}
              >
                The Necromancer{" "}
                <NecromancerSkull
                  height={24}
                  width={24}
                  color={uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                />
              </Text>
            </Link>
          </View>
          <View style={styles.mxAuto}>
            <Link href="/Options/Codex/Player/Paladin" suppressHighlighting>
              <Text
                style={{
                  ...styles.xl,
                  textDecorationLine: "underline",
                  color: "#fcd34d",
                }}
              >
                The Paladin <PaladinHammer height={24} width={24} />
              </Text>
            </Link>
          </View>
          <View style={styles.mxAuto}>
            <Link href="/Options/Codex/Player/Ranger" suppressHighlighting>
              <Text
                style={{
                  ...styles.xl,
                  textDecorationLine: "underline",
                  color: "#4ade80",
                }}
              >
                The Ranger <RangerIcon height={24} width={24} />
              </Text>
            </Link>
          </View>
          <View style={styles.py4}>
            <Text style={{ ...styles.xl, ...styles.textCenter }}>
              Each of these has schools, each housing different styles of magic.
            </Text>
            <Text style={{ ...styles.sm, ...styles.textCenter }}>
              <Text style={{ ...styles.lg, color: "black" }}>Note:</Text> Magic
              of any school can be learned by a player of the parent class.
            </Text>
          </View>

          <View
            style={{
              ...styles.py2,
              ...styles.my2,
              borderWidth: 1,
              borderColor: "#3b82f6",
              backgroundColor:
                uiStore.colorScheme === "dark" ? "#172554" : "#dbeafe",
            }}
          >
            <Link
              href="/Options/Codex/Player/Mage"
              style={styles.mxAuto}
              suppressHighlighting
            >
              <View style={{ ...styles.columnCenter }}>
                <WizardHat
                  height={64}
                  width={64}
                  color={uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                />
                <Text
                  style={{
                    color:
                      uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af",
                  }}
                >
                  Mage
                </Text>
              </View>
            </Link>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link href="/Options/Codex/Player/Water" suppressHighlighting>
                <Water height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Fire" suppressHighlighting>
                <Fire height={48} width={48} />
              </Link>
            </View>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link href="/Options/Codex/Player/Earth" suppressHighlighting>
                <Earth height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Air" suppressHighlighting>
                <Air height={48} width={48} />
              </Link>
            </View>
          </View>

          <View
            style={{
              ...styles.py2,
              ...styles.my2,
              borderWidth: 1,
              borderColor: "#9333ea",
              backgroundColor:
                uiStore.colorScheme === "dark" ? "#581c87" : "#f3e8ff",
            }}
          >
            <Link
              href="/Options/Codex/Player/Necromancer"
              style={styles.mxAuto}
              suppressHighlighting
            >
              <View style={{ ...styles.columnCenter }}>
                <NecromancerSkull
                  width={64}
                  height={64}
                  color={uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                />
                <Text
                  style={{
                    color:
                      uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8",
                  }}
                >
                  Necromancer
                </Text>
              </View>
            </Link>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link href="/Options/Codex/Player/Blood" suppressHighlighting>
                <BloodDrop height={48} width={48} />
              </Link>
              <Link
                href="/Options/Codex/Player/Pestilence"
                suppressHighlighting
              >
                <Pestilence
                  height={48}
                  width={48}
                  color={uiStore.colorScheme == "dark" ? "#84cc16" : "#65a30d"}
                />
              </Link>
            </View>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link href="/Options/Codex/Player/Bone" suppressHighlighting>
                <Bones height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Summoner" suppressHighlighting>
                <SummonerSkull height={48} width={48} />
              </Link>
            </View>
          </View>

          <View
            style={{
              ...styles.py2,
              ...styles.my2,
              borderWidth: 1,
              borderColor: "#fcd34d",
              backgroundColor:
                uiStore.colorScheme === "dark" ? "#713f12" : "#fef9c3",
            }}
          >
            <Link
              style={styles.mxAuto}
              href="/Options/Codex/Player/Paladin"
              suppressHighlighting
            >
              <View style={{ ...styles.columnCenter }}>
                <PaladinHammer width={64} height={64} />
                <Text style={{ color: "#fcd34d" }}>Paladin</Text>
              </View>
            </Link>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link
                href="/Options/Codex/Player/Protection"
                suppressHighlighting
              >
                <Protection height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Vengeance" suppressHighlighting>
                <Vengeance height={48} width={48} />
              </Link>
            </View>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link href="/Options/Codex/Player/Holy" suppressHighlighting>
                <Holy height={48} width={48} />
              </Link>
            </View>
          </View>

          <View
            style={{
              ...styles.py2,
              ...styles.my2,
              borderWidth: 1,
              borderColor: "#4ade80",
              backgroundColor:
                uiStore.colorScheme === "dark" ? "#14532d" : "#dcfce7",
            }}
          >
            <Link
              style={styles.mxAuto}
              href="/Options/Codex/Player/Ranger"
              suppressHighlighting
            >
              <View style={{ ...styles.columnCenter }}>
                <RangerIcon width={64} height={64} />
                <Text style={{ color: "#4ade80" }}>Ranger</Text>
              </View>
            </Link>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link
                href="/Options/Codex/Player/BeastMastery"
                suppressHighlighting
              >
                <BeastMasteryIcon height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Arcane" suppressHighlighting>
                <ArcaneIcon height={48} width={48} />
              </Link>
            </View>
            <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
              <Link
                href="/Options/Codex/Player/Assassination"
                suppressHighlighting
              >
                <AssassinationIcon
                  height={48}
                  width={48}
                  color={uiStore.colorScheme == "dark" ? "#f4f4f5" : "#1e293b"}
                />
              </Link>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function RelationshipsCodex() {
  const images = [
    require("../assets/images/codex/RelationshipsButton.jpeg"),
    require("../assets/images/codex/Relationships.png"),
    require("../assets/images/codex/RelationshipActions.png"),
  ];
  const images2 = [
    require("../assets/images/codex/ActivitiesButton.jpeg"),
    require("../assets/images/codex/Activities.jpeg"),
  ];

  return (
    <View>
      <GenericCarousel images={images} />
      <Text>You can meet new people through various activities</Text>
      <GenericCarousel images={images2} />
    </View>
  );
}
export function ShopsCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}
