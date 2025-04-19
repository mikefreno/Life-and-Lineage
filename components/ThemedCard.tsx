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
  iconDarkening?: number;
}

export default function ThemedCard({
  children,
  style,
  cardStyle,
  iconSource,
  iconDarkening,
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
              blurRadius={0.5}
            />
            <View
              style={[
                styles.imageOverlay,
                {
                  backgroundColor: `rgba(0, 0, 0, ${
                    iconDarkening ? iconDarkening : 0.35
                  })`,
                },
              ]}
            />
          </View>
        ) : null}
        {children}
      </ThemedView>
    </View>
  );
}
