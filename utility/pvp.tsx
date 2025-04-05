import { Potion } from "@/assets/icons/SVGIcons";
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
    case "potion":
      return (
        <Potion color={Colors[colorScheme].text} height={size} width={size} />
      );
  }
};
