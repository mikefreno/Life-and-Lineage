import {
  type ExternalPathString,
  Link,
  type RelativePathString,
} from "expo-router";
import { useVibration } from "@/hooks/generic";
import { type ReactNode } from "react";
import { type TextStyle, type AccessibilityRole } from "react-native";
import { useStyles } from "@/hooks/styles";
import { useRootStore } from "@/hooks/stores";

export default function GenericFlatLink({
  href,
  children,
  style,
  onPress,
  disabled = false,
  ...props
}: {
  href: RelativePathString | ExternalPathString;
  children?: ReactNode;
  style?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | "mixed";
    busy?: boolean;
    expanded?: boolean;
  };
}) {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const vibration = useVibration();

  return (
    <Link
      href={href}
      onPress={() => {
        vibration({ style: "light" });
        if (onPress) {
          onPress();
        }
      }}
      style={[
        styles.flatLinkContainer,
        {
          borderColor: uiStore.colorScheme === "dark" ? "#fafafa" : "#18181b",
        },
        style,
      ]}
      suppressHighlighting
      disabled={disabled}
      {...props}
    >
      {children}
    </Link>
  );
}
