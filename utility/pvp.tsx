import { BookOpen, Flask, Potion } from "@/assets/icons/SVGIcons";
import Colors from "@/constants/Colors";

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
