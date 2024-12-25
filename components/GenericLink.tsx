import {
  type ExternalPathString,
  Link,
  type RelativePathString,
} from "expo-router";
import { useVibration } from "../hooks/generic";
import { type ReactNode } from "react";
import { type AccessibilityRole } from "react-native";

export default function GenericFlatLink({
  href,
  children,
  className = "",
  onPress,
  disabled = false,
  ...props
}: {
  href: RelativePathString | ExternalPathString;
  children?: ReactNode;
  className?: string;
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
      className={`mx-auto rounded-xl border border-zinc-900 px-6 py-2 dark:border-zinc-50 active:scale-95 active:opacity-50 ${className}`}
      suppressHighlighting
      disabled={disabled}
      {...props}
    >
      {children}
    </Link>
  );
}
