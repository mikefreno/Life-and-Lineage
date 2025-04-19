import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useRootStore } from "@/hooks/stores";
import { ClockIcon } from "@/assets/icons/SVGIcons";
import { useStyles } from "@/hooks/styles";

export const GameTickIndicator = observer(() => {
  const rootStore = useRootStore();
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const timerRef = useRef<NodeJS.Timeout>();
  const lastTickerValue = useRef(0);
  const styles = useStyles();

  useEffect(() => {
    if (rootStore.ticker === lastTickerValue.current) {
      slideAnim.setValue(-100);
      return;
    }

    if (rootStore.ticker !== lastTickerValue.current) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 20,
        tension: 50,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
          friction: 8,
          tension: 200,
        }).start(() => {
          lastTickerValue.current = rootStore.ticker;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [rootStore.ticker]);

  return (
    <Animated.View
      style={[
        localStyles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <ClockIcon
        color={Colors.dark.text}
        width={rootStore.uiStore.iconSizeXL}
        height={rootStore.uiStore.iconSizeXL}
      />
      <Text style={[localStyles.text, styles["text-2xl"]]}>
        {rootStore.ticker - lastTickerValue.current}
      </Text>
    </Animated.View>
  );
});

const localStyles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    left: 0,
    top: "15%",
    backgroundColor: Colors.dark.background,
    padding: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  text: {
    color: Colors.dark.text,
  },
});
