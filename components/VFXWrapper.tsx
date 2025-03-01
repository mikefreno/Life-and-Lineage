import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";

export const VFXWrapper = observer(({ children }: { children: ReactNode }) => {
  const { uiStore, dungeonStore } = useRootStore();

  return <View style={{ flex: 1 }}>{children}</View>;
});
