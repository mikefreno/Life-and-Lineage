import { Image } from "expo-image";

export const FireResist = ({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) => (
  <Image
    style={{ height, width }}
    source={require("../assets/images/icons/FireShield.png")}
  />
);

export const ColdResist = ({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) => (
  <Image
    style={{ height, width }}
    source={require("../assets/images/icons/IceShield.png")}
  />
);

export const LightningResist = ({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) => (
  <Image
    style={{ height, width }}
    source={require("../assets/images/icons/LightningShield.png")}
  />
);

export const PoisonResist = ({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) => (
  <Image
    style={{ height, width }}
    source={require("../assets/images/icons/PoisonShield.png")}
  />
);
