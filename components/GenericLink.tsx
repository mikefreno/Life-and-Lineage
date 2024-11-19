import {
  type ExternalPathString,
  Link,
  type RelativePathString,
} from "expo-router";
import { useVibration } from "../hooks/generic";
import { type ReactNode } from "react";

export default function GenericFlatLink({
  href,
  children,
  className = "",
  onPress,
}: {
  href: RelativePathString | ExternalPathString;
  children?: ReactNode;
  className?: string;
  onPress?: () => void;
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
    >
      {children}
    </Link>
  );
}
