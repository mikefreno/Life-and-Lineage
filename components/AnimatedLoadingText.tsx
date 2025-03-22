import { useStyles } from "@/hooks/styles";
import React, { useEffect, useState } from "react";
import { Text } from "@/components/Themed";
import { View } from "react-native";
import { useScaling } from "@/hooks/scaling";

export const AnimatedLoadingText = () => {
  const [dots, setDots] = useState("");
  const styles = useStyles();
  const { getNormalizedSize } = useScaling();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text
      style={{
        paddingHorizontal: getNormalizedSize(4),
        alignSelf: "center",
        ...styles["text-lg"],
      }}
    >
      Loading
      <View style={{ width: getNormalizedSize(24), alignItems: "flex-start" }}>
        <Text style={styles["text-lg"]}>{dots}</Text>
      </View>
    </Text>
  );
};
