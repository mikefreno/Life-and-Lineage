import { Pressable, View } from "react-native";
import { Text } from "./Themed";
import {
  ArmorIcon,
  DexterityIcon,
  Dodge,
  Energy,
  Fire,
  HealthIcon,
  Ice,
  IntelligenceIcon,
  Lightning,
  Pestilence,
  Regen,
  Sanity,
  ShieldSlashIcon,
  StrengthIcon,
  Sword,
} from "../assets/icons/SVGIcons";
import { ItemClassType, Modifier } from "../utility/types";
import { ReactNode, useState } from "react";
import GenericModal from "./GenericModal";
import { Item } from "../entities/item";
import { observer } from "mobx-react-lite";
import {
  ColdResist,
  FireResist,
  LightningResist,
  PoisonResist,
} from "./ResistanceIcons";
import GenericStrikeAround from "./GenericStrikeAround";
import { Image } from "expo-image";
import { cleanRoundToTenths } from "../utility/functions/misc";
import { HealthRegen, SanityRegen } from "./RegenIcons";

const shouldNotShow = ({ mod, item }: { mod: Modifier; item: Item }) => {
  if (!item.stats) return false;
  if (
    mod === "health" ||
    mod === "mana" ||
    mod === "sanity" ||
    mod === "healthRegen" ||
    mod === "manaRegen" ||
    mod === "strength" ||
    mod === "dexterity" ||
    mod === "intelligence" ||
    mod === "fireResistance" ||
    mod === "coldResistance" ||
    mod === "lightningResistance" ||
    mod === "poisonResistance"
  ) {
    return false;
  } else if (
    mod === "physicalDamageMultiplier" ||
    mod === "fireDamageMultiplier" ||
    mod === "coldDamageMultiplier" ||
    mod === "lightningDamageMultiplier" ||
    mod === "poisonDamageMultiplier"
  ) {
    return true;
  } else {
    if (mod == "physicalDamage" || mod == "physicalDamageAdded") {
      if (!!item.stats.physicalDamage && !!item.stats.physicalDamageAdded) {
        if (mod == "physicalDamage") {
          return false;
        }
        return true;
      }
      return false;
    }
    if (mod == "fireDamage" || mod == "fireDamageAdded") {
      if (!!item.stats.fireDamage && !!item.stats.fireDamageAdded) {
        if (mod == "fireDamage") {
          return false;
        }
        return true;
      }
      return false;
    }
    if (mod == "coldDamage" || mod == "coldDamageAdded") {
      if (!!item.stats.coldDamage && !!item.stats.coldDamageAdded) {
        if (mod == "coldDamage") {
          return false;
        }
        return true;
      }
      return false;
    }
    if (mod == "lightningDamage" || mod == "lightningDamageAdded") {
      if (item.stats.lightningDamage && item.stats.lightningDamageAdded) {
        if (mod == "lightningDamage") {
          return false;
        }
        return true;
      }
      return false;
    }
    if (mod == "poisonDamage" || mod == "poisonDamageAdded") {
      if (item.stats.poisonDamage && item.stats.poisonDamageAdded) {
        if (mod == "poisonDamage") {
          return false;
        }
        return true;
      }
      return false;
    }
    if (mod == "armor" || mod == "armorAdded") {
      if (item.stats.armor && item.stats.armorAdded) {
        if (mod == "armor") {
          return false;
        }
        return true;
      }
      return false;
    }
  }
};

const detailedCase = ({
  mod,
  magnitude,
  item,
}: {
  mod: Modifier;
  magnitude: number;
  item: Item;
}) => {
  let value;
  switch (mod) {
    case "health":
      return {
        icon: <HealthIcon height={24} width={24} />,
        desc: "Increased Max Health",
      };
    case "mana":
      return {
        icon: <Energy height={24} width={24} />,
        desc: "Increased Max Mana",
      };
    case "sanity":
      return {
        icon: <Sanity height={24} width={24} />,
        desc: "Increased Max Sanity",
      };
    case "healthRegen":
      return {
        icon: <HealthRegen height={24} width={24} />,
        desc: "Increased Health Regen",
      };
    case "manaRegen":
      return {
        icon: <Regen height={24} width={24} />,
        desc: "Increased Mana Regen",
      };
    case "sanityRegen":
      return {
        icon: <SanityRegen height={24} width={24} />,
        desc: "Increased Sanity Regen",
      };
    case "strength":
      return {
        icon: <StrengthIcon height={24} width={24} />,
        desc: "Increased Strength",
      };
    case "dexterity":
      return {
        icon: <DexterityIcon height={24} width={24} />,
        desc: "Increased Dexterity",
      };
    case "intelligence":
      return {
        icon: <IntelligenceIcon height={24} width={24} />,
        desc: "Increased Dexterity",
      };
    case "armor":
      value = item.stats?.armor?.toString();
      return {
        icon: <ArmorIcon height={24} width={24} />,
        value,
        desc: `Base Item Armor (${cleanRoundToTenths(item.totalArmor)})`,
      };
    case "armorAdded":
      value = item.stats?.armorAdded?.toString();
      return {
        icon: <ArmorIcon height={24} width={24} />,
        value,
        desc: `Armor Added (${cleanRoundToTenths(item.totalArmor)})`,
      };
    case "blockChance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <ShieldSlashIcon height={24} width={24} />,
        value,
        desc: "Base Item Block Chance",
      };
    case "dodgeChance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <Dodge height={24} width={24} />,
        value,
        desc: "Base Item Dodge Chance",
      }; // TODO: Make icon and replace
    case "fireResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <FireResist height={24} width={24} />,
        value,
        desc: "Increased Fire Resistance",
      };
    case "coldResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <ColdResist height={24} width={24} />,
        value,
        desc: "Increased Cold Resistance",
      };
    case "lightningResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <LightningResist height={24} width={24} />,
        value,
        desc: "Increased Lightning Resistance",
      };
    case "poisonResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <PoisonResist height={24} width={24} />,
        value,
        desc: "Increased Poison Resistance",
      };
    case "physicalDamage":
      return {
        icon: <Sword height={24} width={24} />,
        desc: `Base Item Physical Damage (${cleanRoundToTenths(
          item.totalPhysicalDamage,
        )})`,
      };
    case "physicalDamageAdded":
      return {
        icon: <Sword height={24} width={24} />,
        desc: `Physical Damage Added To Attacks/Spells (${cleanRoundToTenths(
          item.totalPhysicalDamage,
        )})`,
      };
    case "physicalDamageMultiplier":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <Sword height={24} width={24} />,
        value,
        desc: `Increased Physical Damage To Attacks/Spells (${cleanRoundToTenths(
          item.totalPhysicalDamage,
        )})`,
      };
    case "fireDamage":
      return {
        icon: <Fire height={24} width={24} />,
        desc: `Base Item Fire Damage (${cleanRoundToTenths(
          item.totalFireDamage,
        )})`,
      };
    case "fireDamageAdded":
      return {
        icon: <Fire height={24} width={24} />,
        desc: `Fire Damage Added To Attacks/Spells (${cleanRoundToTenths(
          item.totalFireDamage,
        )})`,
      };
    case "fireDamageMultiplier":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <Fire height={24} width={24} />,
        value,
        desc: `Increased Fire Damage To Attacks/Spells (${cleanRoundToTenths(
          item.totalFireDamage,
        )})`,
      };
    case "coldDamage":
      return {
        icon: <Ice height={24} width={24} />,
        desc: `Base Item Cold Damage (${cleanRoundToTenths(
          item.totalColdDamage,
        )})`,
      };
    case "coldDamageAdded":
      return {
        icon: <Ice height={24} width={24} />,
        desc: `Cold Damage Added To Attacks/Spells (${cleanRoundToTenths(
          item.totalColdDamage,
        )})`,
      };
    case "coldDamageMultiplier":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <Ice height={24} width={24} />,
        value,
        desc: `Increased Cold Damage To Attacks/Spells (${cleanRoundToTenths(
          item.totalColdDamage,
        )})`,
      };
    case "lightningDamage":
      return {
        icon: <Lightning height={24} width={24} />,
        desc: `Base Item Lightning Damage (${cleanRoundToTenths(
          item.totalLightningDamage,
        )})`,
      };
    case "lightningDamageAdded":
      return {
        icon: <Lightning height={24} width={24} />,
        desc: `Lightning Damage Added To Attacks/Spells (${cleanRoundToTenths(
          item.totalLightningDamage,
        )})`,
      };
    case "lightningDamageMultiplier":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <Lightning height={24} width={24} />,
        value,
        desc: `Increased Lightning Damage To Attacks/Spells (${cleanRoundToTenths(
          item.totalLightningDamage,
        )})`,
      };
    case "poisonDamage":
      return {
        icon: <Pestilence height={24} width={24} />,
        desc: `Base Item Poison Damage (${cleanRoundToTenths(
          item.totalPoisonDamage,
        )})`,
      };
    case "poisonDamageAdded":
      return {
        icon: <Pestilence height={24} width={24} />,
        desc: `Poison Damage Added To Attacks/Spells (${cleanRoundToTenths(
          item.totalPoisonDamage,
        )})`,
      };
    case "poisonDamageMultiplier":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return {
        icon: <Pestilence height={24} width={24} />,
        value,
        desc: `Increased Poison Damage To Attacks/Spells (${cleanRoundToTenths(
          item.totalPoisonDamage,
        )})`,
      };
  }
};

const simpleCase = ({
  mod,
  magnitude,
  item,
}: {
  mod: Modifier;
  magnitude: number;
  item: Item;
}) => {
  let value;
  switch (mod) {
    case "health":
      return { icon: <HealthIcon height={18} width={18} /> };
    case "mana":
      return { icon: <Energy height={18} width={18} /> };
    case "sanity":
      return { icon: <Sanity height={18} width={18} /> };
    case "healthRegen":
      return { icon: <HealthRegen /> };
    case "manaRegen":
      return { icon: <Regen height={18} width={18} /> };
    case "sanityRegen":
      return { icon: <SanityRegen /> };
    case "strength":
      return { icon: <StrengthIcon height={18} width={18} /> };
    case "dexterity":
      return { icon: <DexterityIcon height={18} width={18} /> };
    case "intelligence":
      return { icon: <IntelligenceIcon height={18} width={18} /> };
    case "armor":
    case "armorAdded":
      value = item.totalArmor.toString();
      return { icon: <ArmorIcon height={18} width={18} />, value };
    case "blockChance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return { icon: <ShieldSlashIcon height={18} width={18} />, value };
    case "dodgeChance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return { icon: <Dodge height={18} width={18} />, value };
    case "fireResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return { icon: <FireResist />, value };
    case "coldResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return { icon: <ColdResist />, value };
    case "lightningResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return { icon: <LightningResist />, value };
    case "poisonResistance":
      value = `${cleanRoundToTenths(magnitude * 100)}%`;
      return { icon: <PoisonResist />, value };
    case "physicalDamage":
    case "physicalDamageAdded":
    case "physicalDamageMultiplier":
      value = cleanRoundToTenths(item.totalPhysicalDamage);
      return { icon: <Sword height={18} width={18} />, value };
    case "fireDamage":
    case "fireDamageAdded":
    case "fireDamageMultiplier":
      value = cleanRoundToTenths(item.totalFireDamage);
      return { icon: <Fire height={18} width={18} />, value };
    case "coldDamage":
    case "coldDamageAdded":
    case "coldDamageMultiplier":
      value = cleanRoundToTenths(item.totalColdDamage);
      return { icon: <Ice height={18} width={18} />, value };
    case "lightningDamage":
    case "lightningDamageAdded":
    case "lightningDamageMultiplier":
      value = cleanRoundToTenths(item.totalLightningDamage);
      return { icon: <Lightning height={18} width={18} />, value };
    case "poisonDamage":
    case "poisonDamageAdded":
    case "poisonDamageMultiplier":
      value = cleanRoundToTenths(item.totalPoisonDamage);
      return { icon: <Pestilence height={18} width={18} />, value };
  }
};

const StatRow = observer(
  ({
    mod,
    magnitude,
    detailed = false,
    item,
  }: {
    mod: Modifier;
    magnitude: number;
    detailed?: boolean;
    item: Item;
  }) => {
    if (!detailed && shouldNotShow({ mod, item })) {
      return;
    }
    let valueToShow: string;
    let iconToUse: ReactNode = <View />;
    let detailedDesc: string;

    if (!detailed) {
      const { icon, value } = simpleCase({ mod, magnitude, item });
      iconToUse = icon;
      valueToShow = value ?? magnitude.toString();
      detailedDesc = "";
    } else {
      const { icon, value, desc } = detailedCase({ mod, magnitude, item });
      iconToUse = icon;
      detailedDesc = desc;
      valueToShow = value ?? magnitude.toString();
    }

    return (
      <View className="flex flex-row items-center justify-between w-full space-x-1 m-0.5">
        {iconToUse}
        <Text
          className={`${detailed ? "pl-4 text-center" : ""}`}
        >{`${valueToShow} ${detailedDesc}`}</Text>
      </View>
    );
  },
);

export default function GearStatsDisplay({ item }: { item: Item }) {
  if (!item.stats || Object.keys(item.stats).length === 0) {
    return null;
  }
  const [showingDetailedView, setShowingDetailedView] = useState(false);
  const shouldShowTotalDamage =
    (item.itemClass == ItemClassType.Bow ||
      item.itemClass == ItemClassType.Wand ||
      item.itemClass == ItemClassType.Melee ||
      item.itemClass == ItemClassType.Focus ||
      item.itemClass == ItemClassType.Staff) &&
    item.totalDamage > 0
      ? true
      : false;

  const shouldShowTotalArmor =
    (item.itemClass == ItemClassType.BodyArmor ||
      item.itemClass == ItemClassType.Hat ||
      item.itemClass == ItemClassType.Helmet ||
      item.itemClass == ItemClassType.Shield) &&
    item.totalArmor > 0
      ? true
      : false;

  return (
    <>
      <GenericModal
        isVisibleCondition={showingDetailedView}
        backFunction={() => setShowingDetailedView(false)}
      >
        <View className="px-4">
          <View className="flex flex-row justify-between pb-4">
            {shouldShowTotalDamage ? (
              <View className="w-1/2">
                <Text className="text-3xl" numberOfLines={2}>
                  {cleanRoundToTenths(item.totalDamage)} Total Damage
                </Text>
              </View>
            ) : shouldShowTotalArmor ? (
              <View className="w-1/2">
                <Text className="text-3xl" numberOfLines={2}>
                  {cleanRoundToTenths(item.totalArmor)} Total Armor
                </Text>
              </View>
            ) : (
              <View />
            )}
            <Image
              source={item.getItemIcon()}
              style={{
                width: 48,
                height: 48,
                marginTop: "auto",
                marginBottom: "auto",
              }}
            />
          </View>
          {Object.entries(item.stats).map(([key, value]) => (
            <View key={key} className="">
              <StatRow
                mod={key as Modifier}
                magnitude={value}
                item={item}
                detailed={true}
              />
            </View>
          ))}
          <GenericStrikeAround>
            <Text className="text-sm text-center">
              ( ) Indicates cumulative effect as a standalone item.
            </Text>
          </GenericStrikeAround>
        </View>
      </GenericModal>
      <Pressable
        onLongPress={() => setShowingDetailedView(true)}
        className="flex flex-col rounded-lg bg-zinc-300/50 px-4 py-2 dark:bg-zinc-700/50"
      >
        <View className="flex flex-row flex-wrap items-center justify-center">
          {shouldShowTotalDamage && (
            <Text className="text-xl text-center">
              {cleanRoundToTenths(item.totalDamage)} Total Damage
            </Text>
          )}
          {shouldShowTotalArmor && (
            <Text className="text-xl text-center">
              {cleanRoundToTenths(item.totalArmor)} Total Damage
            </Text>
          )}
          {Object.entries(item.stats).map(([key, value]) => (
            <View key={key} className="w-3/5">
              <StatRow mod={key as Modifier} magnitude={value} item={item} />
            </View>
          ))}
        </View>
        <Text className="mt-2 text-sm text-center w-full">
          Hold for more detail
        </Text>
      </Pressable>
    </>
  );
}
