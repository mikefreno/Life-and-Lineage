import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "@/assets/icons/SVGIcons";
import { PlayerClassOptions } from "@/utility/types";

export default function ClassDisplay({
  playerClass,
  colorScheme,
  size,
}: {
  playerClass: PlayerClassOptions;
  colorScheme: "light" | "dark";
  size: number;
}) {
  switch (playerClass) {
    case PlayerClassOptions.mage:
      return (
        <WizardHat
          width={size}
          height={size}
          color={colorScheme === "dark" ? "#2563eb" : "#1e40af"}
        />
      );
    case PlayerClassOptions.necromancer:
      return (
        <NecromancerSkull
          width={size}
          height={size}
          color={colorScheme === "dark" ? "#9333ea" : "#6b21a8"}
        />
      );
    case PlayerClassOptions.ranger:
      return <RangerIcon width={size} height={size} />;
    case PlayerClassOptions.paladin:
      return <PaladinHammer width={size} height={size} />;
  }
}
