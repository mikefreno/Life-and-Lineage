import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, ScrollView } from "react-native";

import { Text, View } from "../components/Themed";
import "../assets/styles/globals.css";
import { useState } from "react";
import spells from "../assets/json/spells.json";
import LearnSpellComponent from "../components/LearnSpellComponent";

export default function CraftingScreen() {
  const [selectedElement, setSelectedElement] = useState<string>("");

  if (selectedElement == "") {
    return (
      <View className="flex-1 items-center justify-center pb-24">
        <Pressable
          onPress={() => setSelectedElement("fire")}
          className="my-4 w-64 rounded-xl bg-orange-600 py-6 active:scale-95 active:opacity-50"
        >
          <Text
            className="text-center text-3xl font-light"
            style={{ color: "#fafafa" }}
          >
            Fire
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedElement("earth")}
          className="my-4 w-64 rounded-xl bg-[#937D62] py-6 active:scale-95 active:opacity-50"
        >
          <Text
            className="text-center text-3xl font-light"
            style={{ color: "#fafafa" }}
          >
            Earth
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedElement("air")}
          className="my-4 w-64 rounded-xl bg-slate-100 py-6 active:scale-95 active:opacity-50"
        >
          <Text
            className="text-center text-3xl font-light"
            style={{ color: "#27272a" }}
          >
            Air
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedElement("water")}
          className="my-4 w-64 rounded-xl bg-cyan-400 py-6 active:scale-95 active:opacity-50"
        >
          <Text
            className="text-center text-3xl font-light"
            style={{ color: "#fafafa" }}
          >
            Water
          </Text>
        </Pressable>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    );
  } else {
    return (
      <View>
        <Pressable
          onPress={() => setSelectedElement("")}
          style={{ backgroundColor: "#60a5fa" }}
        >
          <Text
            className="py-6 text-center text-2xl"
            style={{ color: "#fafafa" }}
          >
            Back to Element Selection
          </Text>
        </Pressable>
        <ScrollView>
          {spells
            .filter((spell) => spell.name == selectedElement)
            .map((spell, idx) => (
              <LearnSpellComponent
                key={idx}
                title={spell.name}
                desciption={spell.description}
                proficiencyRequirement={spell?.proficiencyNeeded}
                element={selectedElement}
              />
            ))}
        </ScrollView>
      </View>
    );
  }
}
