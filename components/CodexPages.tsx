import { View } from "react-native";
import { CursiveText, Text } from "@/components/Themed";
import {
  Air,
  ArcaneIcon,
  AssassinationIcon,
  BeastMasteryIcon,
  BloodDrop,
  Bones,
  DexterityIcon,
  Earth,
  Energy,
  Fire,
  HealthIcon,
  Holy,
  IntelligenceIcon,
  NecromancerSkull,
  PaladinHammer,
  Pestilence,
  Protection,
  RangerIcon,
  Regen,
  Sanity,
  StrengthIcon,
  SummonerSkull,
  Vengeance,
  Water,
  WizardHat,
} from "@/assets/icons/SVGIcons";
import { Link } from "expo-router";
import { GenericCarousel } from "@/components/GenericCarousel";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { Image } from "expo-image";
import { DamageTypeRender } from "./DamageTypeRender";
import {
  DamageType,
  DamageTypeToString,
  PlayerClassOptions,
} from "@/utility/types";
import { toTitleCase } from "@/utility/functions/misc";
import Colors from "@/constants/Colors";

export function CombatCodex() {
  const styles = useStyles();
  const { uiStore } = useRootStore();

  return (
    <>
      <Text style={styles["text-lg"]}>
        {"    "}The most important factor in combat is preparation. Going into
        the{" "}
        <Link href="/Options/Codex/Dungeon" style={{ color: "#3b82f6" }}>
          dungeons
        </Link>{" "}
        with no{" "}
        <Link href="/Options/Codex/Gear" style={{ color: "#3b82f6" }}>
          armor and weapon{" "}
        </Link>
        is probably not a good idea. Additionally, learning{" "}
        <Link href="/Options/Codex/Magic" style={{ color: "#3b82f6" }}>
          spells
        </Link>{" "}
        can be a make or break for overcoming large challenges
      </Text>

      <View
        style={{
          alignItems: "center",
          borderWidth: 1,
          borderColor: Colors[uiStore.colorScheme].border,
          padding: 2,
          borderRadius: 4,
          marginVertical: 4,
        }}
      >
        <Text style={[styles["text-lg"], { textAlign: "center" }]}>
          Damage is elemental, of the following types:{" "}
        </Text>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 2,
            }}
          >
            <Text style={[styles["text-lg"], { paddingRight: 8 }]}>
              - {toTitleCase(DamageTypeToString[i as DamageType])}
            </Text>
            <DamageTypeRender type={i as DamageType} large />
          </View>
        ))}

        <Text style={[styles["text-lg"], { textAlign: "center" }]}>
          Of these, the one that needs special explanation is `Raw`, unlike all
          other damage types, it has no corresponding resistance. It also scales
          with whichever scaling factor is stronger,{" "}
          <Link href="/Options/Codex/Stats" style={{ color: "#3b82f6" }}>
            magic or attack power.
          </Link>
        </Text>
      </View>
      <Text style={styles["text-lg"]}>
        {"   "}Combat is turn-based, with you first selecting an attack/spell to
        use (or passing), then your{" "}
        <Link href="/Options/Codex/Magic/Minions" style={{ color: "#3b82f6" }}>
          minions or pets
        </Link>
        (if you have any). If your attack can not hit all enemies, i.e. single
        target attack with 2 enemies, you will be presented with the following:
      </Text>
      <Image
        style={{
          height: uiStore.dimensions.height * 0.65,
        }}
        source={require("@/assets/images/codex/TargetSelect.png")}
        contentFit={"contain"}
      />
      <Text style={styles["text-lg"]}>
        {"   "}After your turn, the enemy has theirs, if there are multiple
        enemies, the they go from top to bottom, then minions after that.
      </Text>
      <Text style={styles["text-lg"]}>
        {"   "}All combat situations are flee-able, with the chance of
        successfully fleeing depending on the relative difficulty of the
        dungeon, and the player's{" "}
        <Link
          href="/Options/Codex/Stats?scrollTo=dexterity"
          style={{ color: "#3b82f6" }}
        >
          dexterity{" "}
          <DexterityIcon
            height={uiStore.iconSizeSmall}
            width={uiStore.iconSizeSmall}
          />{" "}
          stat.
        </Link>
      </Text>
    </>
  );
}

export function DungeonCodex() {
  const styles = useStyles();
  return (
    <View>
      <Text style={styles["text-lg"]}>
        {"    "}The dungeons are the core of Life and Lineage. Each dungeon has
        a number of floors to it, that generally get more difficult with each
        floor. Each floor will be cleared when its 'boss' is killed, unlocking
        either the next floor, or a new Dungeon. You will also come across
      </Text>
      <Text style={styles["text-lg"]}>
        {/* TODO: clear up coming soon when pvp is added */}
        {"    "}Clearing a dungeon also provides additional rewards, such as new{" "}
        <Link href="/Options/Codex/Investment" style={{ color: "#3b82f6" }}>
          Investments
        </Link>
        , or gameplay features like PvP(coming soon).
      </Text>

      <Text style={styles["text-lg"]}>
        {"    "}The levels of the dungeon are made up of randomized tiles in a
        maze that contain combat encounters, either normal or boss encounters
        (these are most frequently just a singular enemy, but they can be up to
        4 enemies in a singular encounter). In dungeons you may also run into
        Special Encounters.
      </Text>
      <Text style={styles["text-lg"]}>
        Special Encounters are non-combat tiles that have varying chances of
        good/neutral/bad outcomes when engaged with. They also can be ignored,
        and potentially revisited, when they could be of more use to you.
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}At the top right of the
        <Link href="/dungeon" style={{ color: "#3b82f6" }}>
          {` Dungeon page `}
        </Link>
        you can also find the Training grounds, where you can test out spells
        and equipment.
      </Text>
    </View>
  );
}

export function GearCodex() {
  const styles = useStyles();
  return (
    <View style={{ paddingHorizontal: 8 }}>
      <Text style={styles["text-lg"]}>
        {"    "}At it's core, gear(equipable items) is the culmination of 3
        factors; bases (which are the specific item variant), rarity ('Normal',
        'Magic' or 'Rare') and affixes(explained in detail later).
      </Text>
      <GenericStrikeAround>Bases</GenericStrikeAround>
      <Text style={styles["text-lg"]}>
        {"    "}Bases are the essentially the state of the item if it is
        'Normal', these will have some basic stats like damage for weapons and
        armor for armor. They will also determine the stat requirements for the
        item.
      </Text>
      <GenericStrikeAround>Rarity</GenericStrikeAround>
      <Text style={styles["text-lg"]}>
        {"    "}'Rarity' can be 'Normal', 'Magic' or 'Rare'. 'Magic' items have
        one affix, this can be either a 'Prefix' or 'Suffix'. 'Rare' items have
        both a 'Prefix' and 'Suffix'.
      </Text>
      <GenericStrikeAround>Affixes</GenericStrikeAround>
      <Text style={styles["text-lg"]}>
        {"    "}'Affixes' are of two variants, 'Prefix' or 'Suffix'. Prefixes
        add attribute or defensive modifiers to items and Suffixes add offensive
        modifiers.
      </Text>
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
    <View>
      <Text style={[styles["text-xl"], styles.textCenter, styles.px2]}>
        Labors are a way to earn gold in a (mostly) safe way.
      </Text>
      <Text style={[styles["text-xl"], styles.p2]}>
        {"    "}One need be careful, as performing labor will tick ahead the{" "}
        <Link href="/Options/Codex/Time" style={{ color: "#3b82f6" }}>
          game time
        </Link>{" "}
        meaning rapid use of the labor system can see your life pass by before
        you know it.
      </Text>
      <GenericCarousel images={images} />
      <Text style={[styles["text-xl"], styles.px2]}>
        {"    "}There are a number of jobs you can take, some require no
        qualifications, but most have some.
      </Text>
      <Text style={[styles["text-xl"], styles.p2]}>
        {"    "}To gain new qualifications, go to the{" "}
        <Link href="/Education" style={{ color: "#3b82f6" }}>
          Education page
        </Link>
        , just keep an eye on your sanity.
      </Text>
    </View>
  );
}

export function MagicCodex() {
  const styles = useStyles();
  const { playerState } = useRootStore();
  const ClassSpecificSchoolRender = () => {
    if (playerState) {
      switch (playerState?.playerClass) {
        case PlayerClassOptions.paladin:
          return (
            <Text
              style={[
                styles["text-xl"],
                { letterSpacing: 2, textAlign: "center" },
              ]}
            >
              <Link
                href="/Options/Codex/Player/Fire"
                style={{ color: "#3b82f6" }}
              >
                {`Fire, `}
              </Link>
              <Link
                href="/Options/Codex/Player/Water"
                style={{ color: "#3b82f6" }}
              >
                {`Water, `}
              </Link>
              <Link
                href="/Options/Codex/Player/Air"
                style={{ color: "#3b82f6" }}
              >
                {`Air,`}
              </Link>
              {` and `}
              <Link
                href="/Options/Codex/Player/Earth"
                style={{ color: "#3b82f6" }}
              >
                Earth
              </Link>
            </Text>
          );
        case PlayerClassOptions.necromancer:
          return (
            <Text
              style={[
                styles["text-xl"],
                { letterSpacing: 2, textAlign: "center" },
              ]}
            >
              <Link
                href="/Options/Codex/Player/Blood"
                style={{ color: "#3b82f6" }}
              >
                Blood
              </Link>
              <Link
                href="/Options/Codex/Player/Pestilence"
                style={{ color: "#3b82f6" }}
              >
                Pestilence
              </Link>
              <Link
                href="/Options/Codex/Player/Bone"
                style={{ color: "#3b82f6" }}
              >
                Bone
              </Link>
              <Link
                href="/Options/Codex/Player/Summoning"
                style={{ color: "#3b82f6" }}
              >
                Summoning
              </Link>
            </Text>
          );
        case PlayerClassOptions.ranger:
          return (
            <Text
              style={[
                styles["text-xl"],
                { letterSpacing: 2, textAlign: "center" },
              ]}
            >
              <Link
                href="/Options/Codex/Player/Beast Mastery"
                style={{ color: "#3b82f6" }}
              >
                Beast Mastery
              </Link>
              <Link
                href="/Options/Codex/Player/Arcane"
                style={{ color: "#3b82f6" }}
              >
                Arcane
              </Link>
              <Link
                href="/Options/Codex/Player/Assassination"
                style={{ color: "#3b82f6" }}
              >
                Assassination
              </Link>
            </Text>
          );
        case PlayerClassOptions.paladin:
          return (
            <Text
              style={[
                styles["text-xl"],
                { letterSpacing: 2, textAlign: "center" },
              ]}
            >
              <Link
                href="/Options/Codex/Player/Protection"
                style={{ color: "#3b82f6" }}
              >
                Protection,{" "}
              </Link>
              <Link
                href="/Options/Codex/Player/Vengeance"
                style={{ color: "#3b82f6" }}
              >
                Vengeance,
              </Link>{" "}
              and{" "}
              <Link
                href="/Options/Codex/Player/Holy"
                style={{ color: "#3b82f6" }}
              >
                Holy
              </Link>
            </Text>
          );
      }
    }
    return null;
  };

  return (
    <View>
      <Text style={[styles["text-lg"], { textAlign: "center" }]}>
        Magic comes in schools, specifically, for your class, these are:{" "}
      </Text>
      <ClassSpecificSchoolRender />
      <Text
        style={[styles["text-lg"], { textAlign: "center", paddingVertical: 8 }]}
      >
        (You can see the other{" "}
        <Link href="/Options/Codex/Player" style={{ color: "#3b82f6" }}>
          schools here
        </Link>
        )
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}Magic is a learned skill. Getting access to stronger spells
        requires the use of know spells to gain Proficiency with the school.
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}The spell Proficiency ladder goes like this (from lowest to
        highest proficiency):
      </Text>
      <Text style={styles["text-lg"]}>
        Novice→Apprentice→Adept→Expert→Master→Legend
      </Text>
      <Text style={styles["text-lg"]}>
        - You cannot use/learn spells of a higher proficiency than your
        knowledge in that school.
      </Text>
      <Text style={styles["text-lg"]}>
        - The higher the level of the spell, the greater the proficiency gain
        from its use.
      </Text>
    </View>
  );
}

export function PlayerCodex() {
  const { uiStore } = useRootStore();
  const styles = useStyles();

  return (
    <View>
      <Text style={{ ...styles["text-xl"], ...styles.textCenter }}>
        The player(you) has 4 potential classes:{"\n"}
      </Text>
      <View style={styles.mxAuto}>
        <Link href="/Options/Codex/Player/Mage" suppressHighlighting>
          <Text
            style={{
              ...styles["text-xl"],
              textDecorationLine: "underline",
              color: uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af",
            }}
          >
            The Mage{" "}
            <WizardHat
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
              color={uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af"}
            />
          </Text>
        </Link>
      </View>
      <View style={styles.mxAuto}>
        <Link href="/Options/Codex/Player/Necromancer" suppressHighlighting>
          <Text
            style={{
              ...styles["text-xl"],
              textDecorationLine: "underline",
              color: uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8",
            }}
          >
            The Necromancer{" "}
            <NecromancerSkull
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
              color={uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
            />
          </Text>
        </Link>
      </View>
      <View style={styles.mxAuto}>
        <Link href="/Options/Codex/Player/Paladin" suppressHighlighting>
          <Text
            style={{
              ...styles["text-xl"],
              textDecorationLine: "underline",
              color: "#fcd34d",
            }}
          >
            The Paladin{" "}
            <PaladinHammer
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
            />
          </Text>
        </Link>
      </View>
      <View style={styles.mxAuto}>
        <Link href="/Options/Codex/Player/Ranger" suppressHighlighting>
          <Text
            style={{
              ...styles["text-xl"],
              textDecorationLine: "underline",
              color: "#4ade80",
            }}
          >
            The Ranger{" "}
            <RangerIcon
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
            />
          </Text>
        </Link>
      </View>
      <View style={styles.py4}>
        <Text style={{ ...styles["text-xl"], ...styles.textCenter }}>
          Each of these has schools, each housing different styles of magic.
        </Text>
        <Text style={{ ...styles["text-sm"], ...styles.textCenter }}>
          <Text style={{ ...styles["text-lg"] }}>Note:</Text> Magic of any
          school can be learned by a player of the parent class.
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
                color: uiStore.colorScheme == "dark" ? "#2563eb" : "#1e40af",
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
                color: uiStore.colorScheme == "dark" ? "#9333ea" : "#6b21a8",
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
          <Link href="/Options/Codex/Player/Pestilence" suppressHighlighting>
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
          <Link href="/Options/Codex/Player/Protection" suppressHighlighting>
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
          <Link href="/Options/Codex/Player/BeastMastery" suppressHighlighting>
            <BeastMasteryIcon height={48} width={48} />
          </Link>
          <Link href="/Options/Codex/Player/Arcane" suppressHighlighting>
            <ArcaneIcon height={48} width={48} />
          </Link>
        </View>
        <View style={{ ...styles.rowEvenly, ...styles.py2 }}>
          <Link href="/Options/Codex/Player/Assassination" suppressHighlighting>
            <AssassinationIcon
              height={48}
              width={48}
              color={uiStore.colorScheme == "dark" ? "#f4f4f5" : "#1e293b"}
            />
          </Link>
        </View>
      </View>
      <View></View>
    </View>
  );
}

export function RelationshipsCodex() {
  const images = [
    require("@/assets/images/codex/RelationshipsButton.jpeg"),
    require("@/assets/images/codex/Relationships.png"),
    require("@/assets/images/codex/RelationshipActions.png"),
  ];
  const images2 = [
    require("@/assets/images/codex/ActivitiesButton.jpeg"),
    require("@/assets/images/codex/Activities.jpeg"),
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

export function TimeCodex() {
  const styles = useStyles();
  return (
    <View>
      <CursiveText style={[styles["text-5xl"], { textAlign: "center" }]}>
        "Time is the most valuable thing a man can spend."
      </CursiveText>
      <Text style={{ textAlign: "right" }}>-Theophrastus</Text>
      <View style={{ paddingTop: 16, paddingHorizontal: 8 }}>
        <Text style={styles["text-lg"]}>
          {"    "}
          Nearly every action in Life and Lineage advances the game clock by 1
          week, aging every character. Specifically, this happens every time a
          labor is worked, a medical service is received, talking to character,
          collecting from an investment or leaving a dungeon.
        </Text>
        <Text style={styles["text-lg"]}>
          {"    "}A time indicator, that appears in the top left of the screen
          shows the number of weeks passed by the current action.
        </Text>
        <Text style={styles["text-lg"]}>
          {"    "}
          Starting at the age 45, the
          <Link href="/Options/Codex/Player" style={{ color: "#3b82f6" }}>
            {" "}
            Player
          </Link>{" "}
          starts to roll the possibility of gaining{" "}
          <Link href="/Options/Codex/Conditions" style={{ color: "#3b82f6" }}>
            Conditions.
          </Link>{" "}
        </Text>
        <Text style={styles["text-lg"]}>
          {"    "}The chance is quite low at start, less than once per year, but
          rises as the player ages, up to a cap of once every 5 turns.
        </Text>
        <Text style={styles["text-lg"]}>
          {"    "}Within this, there is a chance that the conditions is much
          worse than a typical condition, a{" "}
          <Link
            href="/Options/Codex/Conditions/Debilitation"
            style={{ color: "#3b82f6" }}
          >
            Debilitation
          </Link>{" "}
          which is a type of condition that is permanent.
        </Text>
        <Text style={styles["text-lg"]}>
          {"    "}The answer, or way to deal with this is to build a Lineage -
          have or adopt children and live on through them.
        </Text>
      </View>
    </View>
  );
}
export const StatsCondex = () => {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  return (
    <View>
      <Text style={[styles["text-lg"], { textAlign: "center" }]}>
        There are 3 primary stats:
      </Text>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: Colors[uiStore.colorScheme].health,
        }}
      >
        <Text style={styles["text-xl"]}>
          - Health{" "}
          <HealthIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        </Text>
        <Text>
          {"    "}The most important stat, of course, when you hit 0, you die.
        </Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: Colors[uiStore.colorScheme].mana,
        }}
      >
        <Text style={styles["text-xl"]}>
          - Mana{" "}
          <Energy
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        </Text>
        <Text>Allows for the casting of spells.</Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: Colors[uiStore.colorScheme].sanity,
        }}
      >
        <Text style={styles["text-xl"]}>
          - Sanity{" "}
          <Sanity
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        </Text>
        <Text>
          {"    "}An odd stat, but one that you can't be complacent about. It
          can go negative, and when it does, you have the potential to gain{" "}
          <Link href="/Options/Codex/Conditions" style={{ color: "#3b82f6" }}>
            conditions.
          </Link>{" "}
          When lowered to the inverse(negative) of the max, you will die.
        </Text>
      </View>
      <Text style={[styles["text-lg"], { textAlign: "center" }]}>
        And 4 secondary stats:
      </Text>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: "#ef4444",
        }}
      >
        <Text style={styles["text-xl"]}>
          - Strength{" "}
          <StrengthIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        </Text>
        <Text>
          {"    "}One of the three stats that impact what gear can be used, this
          stat revolves around the use of melee weapons, (some)bows, shields,
          chest pieces and helmets. Additionally, it scales the application of
          physical damage.
        </Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: "#16a34a",
        }}
      >
        <Text style={styles["text-xl"]}>
          - Dexterity{" "}
          <DexterityIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        </Text>
        <Text>
          {"    "}One of the three stats that impact what gear can be used, this
          stat revolves around the use of bows. Additionally, dexterity impacts
          a sprawling number of other systems. It increases physical
          damage(though to a lesser degree than strength), it also increases the
          chance for a critical hit, which doubles damage, chance to dodge, and
          chance to successfully flee combat.
        </Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: "#60a5fa",
        }}
      >
        <Text style={styles["text-xl"]}>
          - Intelligence{" "}
          <IntelligenceIcon
            height={uiStore.iconSizeLarge}
            width={uiStore.iconSizeLarge}
          />
        </Text>
        <Text>
          {"    "}One of the three stats that impact what gear can be used, this
          stat revolves around the use of wands, robes and hats. Additionally,
          intelligence contributes to the application of all elemental based
          damages.
        </Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: "#3b82f6",
        }}
      >
        <Text style={styles["text-xl"]}>
          - Regen{" "}
          <Regen height={uiStore.iconSizeLarge} width={uiStore.iconSizeLarge} />
        </Text>
        <Text>
          {"    "}Regen is the amount of mana recovered after each turn in
          <Link href="/Options/Codex/Combat" style={{ color: "#3b82f6" }}>
            {" "}
            combat.{" "}
          </Link>
          Effectively, it almost a secondary stat to intelligence, as any spell
          user will need a significant investment into this stat.
        </Text>
      </View>
      <Text style={[styles["text-lg"], { textAlign: "center" }]}>
        There are also 2 derived stats:
      </Text>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: "#ef4444",
        }}
      >
        <Text style={styles["text-xl"]}>- Attack Power</Text>
        <Text>
          {"    "}Derived from strength and dexterity, which each point of
          strength contributing more, this increases all physical damage.
        </Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          alignItems: "center",
          paddingVertical: 4,
          marginVertical: 4,
          borderColor: "#60a5fa",
        }}
      >
        <Text style={styles["text-xl"]}>- Magic Power</Text>
        <Text>
          {"    "}Derived from intelligence alone, increases all elemental based
          damages.
        </Text>
      </View>
      <Text style={[styles["text-xl"], { textAlign: "center" }]}>
        All stats can be affected by both{" "}
        <Link href="/Options/Codex/Gear" style={{ color: "#3b82f6" }}>
          Gear
        </Link>{" "}
        and{" "}
        <Link href="/Options/Codex/Conditions" style={{ color: "#3b82f6" }}>
          Conditions
        </Link>
      </Text>
    </View>
  );
};

export function InvestmentsCodex() {
  const styles = useStyles();
  return (
    <View>
      <Text style={styles["text-lg"]}>
        {"    "}Accessed through the{" "}
        <Link href="/Investing" style={{ color: "#3b82f6" }}>
          Investing page
        </Link>
        , Investments are a way to put your money to work. They are unlocked by
        clearing{" "}
        <Link href="/Options/Codex/Dungeon" style={{ color: "#3b82f6" }}>
          dungeons.
        </Link>
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}At various intervals, investments will generate gold in a range,
        it is worth noting that this action (like many others), moves the game{" "}
        <Link href="/Options/Codex/Time" style={{ color: "#3b82f6" }}>
          time
        </Link>{" "}
        forward.
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}All investments have a number of upgrades. Most of these are
        straightforward, providing a direct benefit, such as higher floor for
        each return interval, but others are more complex.
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}For instance some upgrades might have a mutually exclusive
        upgrade, another case is morally questionable upgrades that will take a
        toll on your{" "}
        <Link
          href="/Options/Codex/Stats?scrollTo=Sanity"
          style={{ color: "#3b82f6" }}
        >
          Sanity.
        </Link>
      </Text>
    </View>
  );
}

export function ConditionsCodex() {
  const styles = useStyles();
  return (
    <View>
      <Text style={styles["text-lg"]}>
        {"    "}Conditions are temporary effects applied by attack/spells, low
        sanity, and old age. Old age specifically, can apply a nasty variant of
        Conditions, called Debilitations, these are permanent, unique (cannot
        have more that one of each `type` - whereas normal Conditions can stack
        indefinitely), and their effect is often extremely dangerous.
      </Text>
      <Text style={styles["text-lg"]}>
        {"    "}Conditions tick every{" "}
        <Link href="/Options/Codex/Combat" style={{ color: "#3b82f6" }}>
          combat{" "}
        </Link>
        turn, or game{" "}
        <Link href="/Options/Codex/Time" style={{ color: "#3b82f6" }}>
          time{" "}
        </Link>
        tick reducing the number of turns remaining(if applicable). In combat,
        the tick happens at the end of your turn if the condition is on you, and
        at the end of the enemy's turn, if on the enemy.
      </Text>

      <Text style={styles["text-lg"]}>
        {"    "}Some conditions are constant, in that their effect is ongoing
        for the lifetime of the Condition, while others only apply their effect
        when they tick.
      </Text>
    </View>
  );
}

export function PvPCodex() {
  const styles = useStyles();
  return <View></View>;
}
