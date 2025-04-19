import React, { useState, useRef, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Text } from "@/components/Themed";
import { observer } from "mobx-react-lite";
import GenericModal from "@/components/GenericModal";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { tw, tw_base, useStyles } from "@/hooks/styles";
import Colors from "@/constants/Colors";
import GenericRaisedButton from "./GenericRaisedButton";
import { ExternalPathString, RelativePathString, useRouter } from "expo-router";
import GenericFlatButton from "./GenericFlatButton";

export type NewFeaturePage = {
  title: string;
  body: string;
  link: { path: RelativePathString | ExternalPathString; string: string };
};

interface IFeatureUpdateModalProps {
  isVisible: boolean;
  pages: NewFeaturePage[];
  onClose: () => void;
}

const FeatureUpdateModal = observer(
  ({ isVisible, pages, onClose }: IFeatureUpdateModalProps) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();
    const vibration = useVibration();
    const theme = Colors[uiStore.colorScheme];
    const router = useRouter();

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const currentPageIndexRef = useRef(0);

    useEffect(() => {
      if (!isVisible) {
        setTimeout(() => {
          setCurrentPageIndex(0);
          currentPageIndexRef.current = 0;
        }, 300);
      }
    }, [isVisible]);

    const handleNext = () => {
      if (currentPageIndexRef.current < pages.length - 1) {
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

    const handleClose = () => {
      vibration({ style: "light" });
      onClose();
    };

    const renderPageContent = (
      page: NewFeaturePage,
      index: number,
      total: number,
    ) => {
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
                <Text style={[styles["text-md"], { color: theme.dimmed }]}>
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
          {page.link && (
            <GenericFlatButton onPress={() => router.push(page.link.path)}>
              {page.link.string}
            </GenericFlatButton>
          )}
          <GenericRaisedButton onPress={handleNext} style={tw.mt4}>
            {index < total - 1 ? "Next" : "Acknowledge Knowledge"}
          </GenericRaisedButton>
        </>
      );
    };

    if (!pages || pages.length === 0 || currentPageIndex >= pages.length) {
      return null;
    }

    const currentPageContent = pages[currentPageIndex];

    return (
      <GenericModal
        isVisibleCondition={isVisible}
        backFunction={handleClose}
        accessibilityLabel="New Features Announced"
      >
        {renderPageContent(currentPageContent, currentPageIndex, pages.length)}
      </GenericModal>
    );
  },
);

export default FeatureUpdateModal;
