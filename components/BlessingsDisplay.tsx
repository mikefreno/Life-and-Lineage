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
  Pestilence,
  Protection,
  SummonerSkull,
  Vengeance,
  Water,
} from "@/assets/icons/SVGIcons";
import { Element } from "@/utility/types";

interface BlessingDisplayProps {
  blessing: Element;
  colorScheme: string;
  size?: number;
}

export default function BlessingDisplay({
  blessing,
  colorScheme,
  size = 100,
}: BlessingDisplayProps) {
  switch (blessing) {
    case Element.fire:
      return <Fire height={size} width={size * 0.75} />;
    case Element.water:
      return <Water height={size} width={size * 1.125} />;
    case Element.air:
      return <Air height={size} width={size} />;
    case Element.earth:
      return <Earth height={size} width={size} />;
    case Element.holy:
      return <Holy height={size} width={size} />;
    case Element.protection:
      return <Protection height={size} width={size} />;
    case Element.vengeance:
      return <Vengeance height={size} width={size} />;
    case Element.blood:
      return <BloodDrop height={size} width={size * 0.75} />;
    case Element.bone:
      return <Bones height={size} width={size * 0.75} />;
    case Element.summoning:
      return <SummonerSkull height={size} width={size * 1.125} />;
    case Element.pestilence:
      return (
        <Pestilence
          height={size}
          width={size * 1.125}
          color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
        />
      );
    case Element.beastMastery:
      return <BeastMasteryIcon height={size} width={size} />;
    case Element.assassination:
      return (
        <AssassinationIcon
          height={size}
          width={size}
          color={colorScheme == "dark" ? "#99e7ff" : "#1e293b"}
        />
      );
    case Element.arcane:
      return <ArcaneIcon height={size} width={size} />;
    default:
      return <Fire height={size} width={size * 0.75} />;
  }
}
