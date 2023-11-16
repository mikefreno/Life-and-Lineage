import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProgressBarProps {
  value: number;
  minValue?: number;
  maxValue: number;
  borderColor?: string;
  filledColor?: string;
  unfilledColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  minValue = 0,
  maxValue,
  borderColor,
  filledColor = "#007BFF",
  unfilledColor = "#f3f3f3",
}) => {
  const width = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: unfilledColor,
          borderColor: borderColor,
          borderWidth: borderColor ? 1 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: width < 5 ? "5%" : `${width}%`,
            backgroundColor: filledColor,
          },
        ]}
      >
        <Text style={[styles.label, { marginTop: borderColor ? -1 : 0 }]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 14,
    borderRadius: 50,
  },
  inner: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  label: {
    color: "#fff",
    fontSize: 12,
  },
});
