import React, { useState, useRef } from "react";
import { View, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Text } from "@/components/Themed";
import { observer } from "mobx-react-lite";
import GenericModal from "@/components/GenericModal";
import { useRootStore } from "@/hooks/stores";
import { tw, tw_base, useStyles } from "@/hooks/styles";
import Colors from "@/constants/Colors";
import GenericRaisedButton from "./GenericRaisedButton";

const PagedContentModal = observer(
  ({
    pages,
    isVisible,
    handleClose,
  }: {
    pages: { title?: string; body: string }[];
    isVisible: boolean;
    handleClose: () => void;
  }) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();
    const theme = Colors[uiStore.colorScheme];

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const currentPageIndexRef = useRef(0);

    const handleNext = () => {
      if (currentPageIndex < pages.length - 1) {
        setCurrentPageIndex((prev) => prev + 1);
        currentPageIndexRef.current++;
      } else {
        handleClose();
      }
    };

    const handleBack = () => {
      if (currentPageIndexRef.current > 0) {
        setCurrentPageIndex((prev) => prev - 1);
        currentPageIndexRef.current--;
      }
    };

    const renderPageContent = (
      page: { title?: string; body: string } | undefined,
      index: number,
      total: number,
    ) => {
      if (!page) return null;
      return (
        <>
          <View style={[styles.rowBetween, { alignItems: "center" }]}>
            <View style={{ width: tw_base[6] }}>
              {index > 0 ? (
                <Pressable
                  onPress={handleBack}
                  accessibilityLabel="Previous feature update page"
                >
                  <Entypo
                    name="chevron-left"
                    size={uiStore.iconSizeLarge}
                    color={
                      uiStore.colorScheme === "dark" ? theme.text : theme.text
                    }
                  />
                </Pressable>
              ) : (
                <View style={{ width: tw_base[6] }} />
              )}
            </View>

            {page.title && (
              <Text
                style={{
                  textAlign: "center",
                  flex: 1,
                  ...styles["text-2xl"],
                  fontWeight: "bold",
                }}
                accessibilityRole="header"
              >
                {page.title}
              </Text>
            )}

            <View style={{ width: tw_base[6], alignItems: "flex-end" }}>
              {total > 1 ? (
                <Text
                  style={[
                    styles["text-md"],
                    { color: theme.text, opacity: 0.9 },
                  ]}
                >
                  {index + 1}/{total}
                </Text>
              ) : (
                <View style={{ width: tw_base[6] }} />
              )}
            </View>
          </View>

          <Text style={[tw.mt3, { textAlign: "center" }, styles.bodyText]}>
            {page.body}
          </Text>
          <GenericRaisedButton onPress={handleNext}>
            {index < total - 1 ? "Next" : "Acknowledge Knowledge"}
          </GenericRaisedButton>
        </>
      );
    };

    const currentPageContent = pages[currentPageIndex];

    return (
      <GenericModal isVisibleCondition={isVisible} backFunction={handleClose}>
        {renderPageContent(currentPageContent, currentPageIndex, pages.length)}
      </GenericModal>
    );
  },
);

export default PagedContentModal;
