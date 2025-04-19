import { type ReactNode } from "react";
import { ViewStyle, View } from "react-native";
import { useStyles } from "@/hooks/styles";
import { ThemedView } from "@/components/Themed";
import { useScaling } from "@/hooks/scaling";
import { Image } from "expo-image";

interface ThemedCard {
  children?: ReactNode;
  style?: ViewStyle;
  cardStyle?: ViewStyle;
  iconSource?: any;
}

export default function ThemedCard({
  children,
  style,
  cardStyle,
  iconSource,
}: ThemedCard) {
  const styles = useStyles();
  const { getNormalizedSize } = useScaling();

  return (
    <View style={{ margin: getNormalizedSize(6), borderRadius: 12, ...style }}>
      <ThemedView
        style={[
          styles.themedCard,
          { ...cardStyle, overflow: "hidden", borderRadius: 12 },
        ]}
      >
        {iconSource ? (
          <View style={styles.imageContainer}>
            <Image
              source={iconSource}
              style={styles.laborIcon}
              blurRadius={1}
            />
            <View style={styles.imageOverlay} />
          </View>
        ) : null}
        {children}
      </ThemedView>
    </View>
  );
}
