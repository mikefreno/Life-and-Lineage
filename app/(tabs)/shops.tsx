import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { CharacterImage } from "../../components/CharacterImage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { toTitleCase } from "../../utility/functions/misc";
import { TutorialOption } from "../../utility/types";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "../../components/Themed";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { type Shop } from "../../entities/shop";
import { shopColors } from "../../constants/Colors";
import { useStyles } from "../../hooks/styles";

const ShopsScreen = observer(() => {
  const vibration = useVibration();
  const { shopsStore, uiStore } = useRootStore();
  const [isReady, setIsReady] = useState(false);
  const styles = useStyles();

  const runDeathChecks = () => {
    shopsStore?.shopsMap.forEach((shop) => shop.deathCheck());
  };

  useEffect(() => {
    if (!isReady) {
      runDeathChecks();
      setIsReady(true);
    }
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    shopsStore.setOnShopTab(isFocused);

    return () => {
      shopsStore.setOnShopTab(false);
    };
  }, [isFocused]);

  const headerHeight = useHeaderHeight();
  const bottomHeight = useBottomTabBarHeight();

  const renderItem = (shop: Shop) => {
    const colors = shopColors[shop.archetype];
    if (!colors) return;

    return (
      <View style={styles.shopCard} key={shop.shopKeeper.id}>
        <View
          style={[
            styles.shopCardInner,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              shadowColor: colors.border,
              shadowOpacity: 0.3,
              elevation: 4,
            },
          ]}
        >
          <View style={{ justifyContent: "space-between", flex: 1 }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 24,
                lineHeight: 32,
                color: colors.text,
              }}
              numberOfLines={2}
            >
              The {toTitleCase(shop.archetype)}
            </Text>
            <CharacterImage character={shop.shopKeeper} />
            <Text style={{ textAlign: "center", color: colors.text }}>
              {shop.shopKeeper.fullName}
            </Text>
            <Pressable
              style={{ marginBottom: 8, marginHorizontal: "auto" }}
              onPress={() => {
                vibration({ style: "light" });
                shopsStore.setCurrentShop(shop);
                router.push(`/ShopInterior`);
              }}
            >
              {({ pressed }) => (
                <View
                  style={[
                    {
                      ...styles.enterButtonInner,
                      shadowColor: colors.border,
                      elevation: 2,
                      backgroundColor: colors.border,
                      shadowOpacity: 0.5,
                      shadowRadius: 5,
                      opacity: pressed ? 0.5 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, color: colors.text }}>
                    Enter
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.shops}
        isFocused={isFocused}
        pageOne={{
          title: "Shop Tab",
          body: "Each of these shops buy and sell various types of items.",
        }}
        pageTwo={{
          title: "Stock Refresh Schedule",
          body: "Each shop refreshes its stock and gold supply every real world hour.",
        }}
      />

      {isReady ? (
        <ScrollView
          contentInset={{
            top: headerHeight / 2,
            bottom: (bottomHeight + uiStore.playerStatusHeight + 80) / 2,
          }}
          style={{
            marginTop: headerHeight / 2,
          }}
          scrollIndicatorInsets={{ top: 0, bottom: 0 }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
          >
            {shopsStore &&
              [...shopsStore.shopsMap.values()].map((shop) => renderItem(shop))}
          </View>
        </ScrollView>
      ) : null}
    </>
  );
});
export default ShopsScreen;
