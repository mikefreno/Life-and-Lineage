import Fire from "../assets/icons/FireIcon";
import Water from "../assets/icons/WaterIcon";
import Air from "../assets/icons/AirIcon";
import Earth from "../assets/icons/EarthIcon";
import Sun from "../assets/icons/SunIcon";
import Swords from "../assets/icons/SwordsIcon";
import Shield from "../assets/icons/ShieldIcon";
import HoldingSkull from "../assets/icons/HoldingSkull";
import Virus from "../assets/icons/VirusIcon";
import Bones from "../assets/icons/BonesIcon";
import Drop from "../assets/icons/DropIcon";

export default function blessingDisplay(
  blessing: string,
  colorScheme: string,
  size: number = 100,
) {
  switch (blessing) {
    case "fire":
      return <Fire height={size} width={size} color={"#ea580c"} />;
    case "water":
      return <Water height={size} width={size} color={"#3b82f6"} />;
    case "air":
      return <Air height={size} width={size} color={"#cbd5e1"} />;
    case "earth":
      return <Earth height={size} width={size} color={"#937D62"} />;
    case "holy":
      return <Sun height={size} width={size} color={"#facc15"} />;
    case "protection":
      return <Shield height={size} width={size} color={"#3b82f6"} />;
    case "vengeance":
      return <Swords height={size} width={size} color={"#cbd5e1"} />;
    case "blood":
      return <Drop height={size} width={size} color={"#991b1b"} />;
    case "bone":
      return <Bones height={size} width={size} color={"#9ca3af"} />;
    case "summoning":
      return <HoldingSkull height={size} width={size} color={"#4b5563"} />;
    case "pestilence":
      return (
        <Virus
          height={size}
          width={size}
          color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
        />
      );
    default:
      throw new Error(`invalid blessing ${blessing}`);
  }
}
