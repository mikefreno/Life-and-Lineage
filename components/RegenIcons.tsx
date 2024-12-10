import { Image } from "expo-image";

export const HealthRegen = ({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) => (
  <Image
    style={{ height, width }}
    source={require("../assets/images/icons/HealthRegen.png")}
  />
);

export const SanityRegen = ({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) => (
  <Image
    style={{ height, width }}
    source={require("../assets/images/icons/SanityRegen.png")}
  />
);
