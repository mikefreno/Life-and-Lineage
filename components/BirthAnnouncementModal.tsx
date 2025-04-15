import { observer } from "mobx-react-lite";
import GenericModal from "./GenericModal";
import { useEffect, useState } from "react";
import { Character } from "@/entities/character";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { TextInput, View } from "react-native";
import { Text } from "./Themed";
import GenericRaisedButton from "./GenericRaisedButton";
import { trimWhitespace } from "@/utility/functions/characterAid";
import { toTitleCase } from "@/utility/functions/misc";
import GenericFlatButton from "./GenericFlatButton";

export const BirthAnnouncementModal = observer(() => {
  const { uiStore } = useRootStore();
  const styles = useStyles();
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [newbornBaby, setNewbornBaby] = useState<Character | null>(null);
  const [choosingName, setChoosingName] = useState<boolean>(false);
  const [chosenFirstName, setChosenFirstName] = useState<string>();
  useEffect(() => {
    if (uiStore.newbornBaby) {
      setNewbornBaby(uiStore.newbornBaby);
      setShowBirthModal(true);
    }
  }, [uiStore.newbornBaby]);

  return (
    <GenericModal
      isVisibleCondition={showBirthModal && newbornBaby !== null}
      backFunction={() => {
        setShowBirthModal(false);
        if (chosenFirstName) {
          newbornBaby?.setFirstName(chosenFirstName);
        }
        uiStore.setNewbornBaby(null);
      }}
      backdropCloses={false}
      accessibilityLabel="Birth Announcement"
    >
      <View style={styles.itemsCenter}>
        <Text style={{ ...styles["text-2xl"], ...styles.textCenter }}>
          A Child is Born!
        </Text>
        <>
          <Text
            style={{
              ...styles["text-xl"],
              ...styles.textCenter,
              ...styles.mt4,
            }}
          >
            Your partner suggests the name: {newbornBaby?.firstName}
          </Text>
          {choosingName && (
            <TextInput
              style={[
                styles.nameInput,
                {
                  borderColor: uiStore.isDark ? "#fafafa" : "#27272a",
                  color: uiStore.isDark ? "#fafafa" : "#09090b",
                  width: uiStore.dimensions.width * 0.65,
                },
              ]}
              placeholderTextColor={uiStore.isDark ? "#71717a" : "#d4d4d8"}
              onChangeText={(text) => {
                setChosenFirstName(text.replace(/^\s+/, ""));
              }}
              onBlur={() => {
                setChosenFirstName(trimWhitespace(chosenFirstName ?? ""));
              }}
              placeholder={"Given Name (First Name)"}
              value={chosenFirstName}
              autoCorrect={false}
              autoCapitalize="words"
              autoComplete="given-name"
              maxLength={16}
              accessibilityHint="Enter Your Child's First Name"
              accessibilityLabel="First Name"
            />
          )}
          <GenericRaisedButton onPress={() => setChoosingName(!choosingName)}>
            {choosingName ? "Use Partner Suggested Name" : "Suggest A Name"}
          </GenericRaisedButton>
          <Text style={{ ...styles.textCenter, ...styles.mt2 }}>
            Sex: {newbornBaby?.sex ? toTitleCase(newbornBaby?.sex) : "Unknown"}
          </Text>
          <Text style={{ ...styles.textCenter, ...styles.mt4 }}>
            Born to:{" "}
            {newbornBaby?.parents && newbornBaby?.parents.length > 0
              ? newbornBaby.parents[0]?.fullName || "Unknown Parent"
              : "Unknown Parent"}
            {newbornBaby?.parents &&
              newbornBaby.parents.length > 1 &&
              newbornBaby.parents[1]?.fullName &&
              ` and ${newbornBaby.parents[1].fullName}`}
          </Text>
        </>
        <Text style={{ ...styles.textCenter, ...styles.mt4 }}>
          Child information unavailable
        </Text>
        <Text style={{ ...styles.textCenter, ...styles.mt4 }}>
          The child will be known as{" "}
          {choosingName
            ? `${chosenFirstName} ${newbornBaby?.lastName}`
            : newbornBaby?.fullName}
        </Text>
        <GenericFlatButton
          onPress={() => {
            setShowBirthModal(false);
            if (chosenFirstName) {
              newbornBaby?.setFirstName(chosenFirstName);
            }
            uiStore.setNewbornBaby(null);
          }}
          disabled={choosingName && !chosenFirstName}
          style={styles.mt4}
        >
          Close
        </GenericFlatButton>
      </View>
    </GenericModal>
  );
});
