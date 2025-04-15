import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Themed";
import GenericModal from "@/components/GenericModal";
import GenericFlatButton from "@/components/GenericFlatButton";
import { observer } from "mobx-react-lite";
import { CharacterImage } from "@/components/CharacterImage";
import { AffectionIcon } from "@/assets/icons/SVGIcons";
import { useRootStore } from "@/hooks/stores";
import type { Character } from "@/entities/character";
import { useStyles } from "@/hooks/styles";

interface DateResultModalProps {
  isVisible: boolean;
  character: Character | null;
  affectionChange: number;
  dateLocation: string;
  closeFunction: () => void;
}

const DateResultModal = observer(
  ({
    isVisible,
    character,
    affectionChange,
    dateLocation,
    closeFunction,
  }: DateResultModalProps) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();

    if (!character) return null;

    const isPositive = affectionChange > 0;
    const resultText = isPositive
      ? `Your date with ${character.fullName} at the ${dateLocation} went well.`
      : `Your date with ${character.fullName} at the ${dateLocation} didn't go as planned.`;

    const detailText = isPositive
      ? [
          "They seemed to enjoy your company.",
          "The conversation flowed naturally.",
          "You both shared a few laughs.",
        ][Math.floor(Math.random() * 3)]
      : [
          "There were several awkward silences.",
          "You may have said something that offended them.",
          "They seemed distracted throughout the evening.",
        ][Math.floor(Math.random() * 3)];

    return (
      <GenericModal
        isVisibleCondition={isVisible}
        backdropCloses={false}
        backFunction={closeFunction}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={[
              styles["text-2xl"],
              styles.textCenter,
              { marginBottom: 16 },
            ]}
          >
            Date Results
          </Text>

          <View
            style={{
              width: uiStore.dimensions.lesser * 0.3,
              height: uiStore.dimensions.lesser * 0.3,
              alignSelf: "center",
              marginBottom: 16,
            }}
          >
            <CharacterImage character={character} />
          </View>

          <Text
            style={[styles["text-lg"], styles.textCenter, { marginBottom: 8 }]}
          >
            {resultText}
          </Text>

          <Text style={[styles.textCenter, { marginBottom: 16 }]}>
            {detailText}
          </Text>

          <View
            style={[
              styles.rowCenter,
              { marginBottom: 16, alignItems: "center" },
            ]}
          >
            <AffectionIcon
              height={uiStore.iconSizeSmall}
              width={uiStore.iconSizeSmall}
            />
            <Text
              style={[
                styles["text-lg"],
                { marginLeft: 8, color: isPositive ? "#10b981" : "#ef4444" },
              ]}
            >
              {isPositive ? "+" : ""}
              {affectionChange}
            </Text>
          </View>

          <GenericFlatButton onPress={closeFunction}>Close</GenericFlatButton>
        </View>
      </GenericModal>
    );
  },
);

export default DateResultModal;
