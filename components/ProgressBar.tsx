import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text } from "./Themed";

interface ProgressBarProps {
  value: number;
  minValue?: number;
  maxValue: number;
  borderColor?: string;
  filledColor?: string;
  unfilledColor?: string;
  textColor?: string;
  displayNumber?: boolean;
  removeAtZero?: boolean;
  showMax?: boolean;
}

const ProgressBar = ({
  value,
  minValue = 0,
  maxValue,
  borderColor,
  filledColor = "#007BFF",
  unfilledColor = "#f3f3f3",
  textColor = "#fff",
  displayNumber = true,
  removeAtZero = false,
  showMax = false,
}: ProgressBarProps) => {
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
            width: !removeAtZero
              ? width < 5
                ? "5%"
                : `${width}%`
              : `${width}%`,
            backgroundColor: filledColor,
            position: "absolute",
          },
        ]}
      >
        {displayNumber && (
          <View
            className={`${
              Platform.OS === "android" ? "-mt-0.5" : ""
            } mx-auto flex-1 flex-wrap overflow-visible`}
          >
            <Text
              style={{
                marginTop: borderColor ? -1 : 0,
                color: textColor,
              }}
            >
              {value}
              {showMax ? ` / ${maxValue}` : ""}
            </Text>
          </View>
        )}
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
});
