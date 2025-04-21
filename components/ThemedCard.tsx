import { type ReactNode } from "react";
import { ViewStyle, View, Platform } from "react-native";
import { useStyles } from "@/hooks/styles";
import { ThemedView } from "@/components/Themed";
import { useScaling } from "@/hooks/scaling";
import { Image } from "expo-image";
import { useRootStore } from "@/hooks/stores";

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
  const { uiStore } = useRootStore();

  return (
    <View
      style={{
        margin: getNormalizedSize(6),
        borderRadius: 12,
        ...style,
        shadowColor: uiStore.colorScheme === "dark" ? "#fff" : "#000",
        shadowOffset: { width: 0, height: 2 } as const,
        shadowOpacity: Platform.OS === "android" ? 0.9 : 0.2,
      }}
    >
      <ThemedView
        style={[styles.themedCard, { ...cardStyle, borderRadius: 12 }]}
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
