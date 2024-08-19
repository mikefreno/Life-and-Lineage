import {
  Air,
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
} from "../assets/icons/SVGIcons";

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
      return <Holy height={size} width={size} color={"#facc15"} />;
    case "protection":
      return <Protection height={size} width={size} color={"#3b82f6"} />;
    case "vengeance":
      return <Vengeance height={size} width={size} color={"#cbd5e1"} />;
    case "blood":
      return <BloodDrop height={size} width={size} color={"#991b1b"} />;
    case "bone":
      return <Bones height={size} width={size} color={"#9ca3af"} />;
    case "summoning":
      return <SummonerSkull height={size} width={size} color={"#4b5563"} />;
    case "pestilence":
      return (
        <Pestilence
          height={size}
          width={size}
          color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
        />
      );
    default:
      return <Fire height={size} width={size} color={"#ea580c"} />;
  }
}
