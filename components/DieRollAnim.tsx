import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { rollD20 } from "../utility/functions/roll";
import D20SVG from "../assets/icons/D20SVG";

const D20Die = () => {
  const [diceValue, setDiceValue] = useState(1);
  const spinValue = useRef(new Animated.Value(0)).current;

  const roll = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setDiceValue(rollD20());
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  const scale = spinValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.diceContainer,
          {
            transform: [{ rotateZ: spin }, { rotateY: spin }, { scale: scale }],
          },
        ]}
      >
        <D20SVG />
        <Text style={styles.diceText}>{diceValue}</Text>
      </Animated.View>
      <Pressable style={styles.button} onPress={roll}>
        <Text style={styles.buttonText}>Roll D20</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  diceContainer: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  diceText: {
    fontSize: 48,
    fontWeight: "bold",
    position: "absolute",
    color: "#333",
    paddingTop: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default D20Die;
