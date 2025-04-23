import { BookOpen, Flask, Potion } from "@/assets/icons/SVGIcons";
import Colors from "@/constants/Colors";
import { AIPlayerCharacter } from "@/entities/AIPlayerCharacter";
import { View } from "react-native";

export const PvPRewardIcons = ({
  icon,
  size,
  colorScheme,
}: {
  icon: string;
  size: number;
  colorScheme: "light" | "dark";
}) => {
  switch (icon) {
    case "flask":
      return (
        <Flask color={Colors[colorScheme].text} height={size} width={size} />
      );
    case "book":
      return (
        <BookOpen color={Colors[colorScheme].text} height={size} width={size} />
      );
    case "potion":
      return (
        <Potion color={Colors[colorScheme].text} height={size} width={size} />
      );
  }
};

export const EnemyPlayerCard = ({}: { enemyPlayer: AIPlayerCharacter }) => {
  return <View></View>;
};
