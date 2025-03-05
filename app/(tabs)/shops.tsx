import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { CharacterImage } from "../../components/CharacterImage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import TutorialModal from "../../components/TutorialModal";
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

  const headerHeight = useHeaderHeight();

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
          <Text
            style={[
              {
                textAlign: "center",
                color: colors.text,
              },
              styles["text-3xl"],
            ]}
            numberOfLines={2}
          >
            {`The\n${toTitleCase(shop.archetype)}`}
          </Text>
          <View
            style={{
              width: "100%",
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <CharacterImage character={shop.shopKeeper} />
            <Text
              style={[
                styles["text-lg"],
                { textAlign: "center", color: colors.text },
              ]}
            >
              {shop.shopKeeper.fullName}
            </Text>
          </View>
          <Pressable
            style={{
              marginBottom: 8,
              marginHorizontal: "auto",
              justifyContent: "flex-end",
            }}
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
                <Text style={[styles["text-lg"], { color: colors.text }]}>
                  Enter
                </Text>
              </View>
            )}
          </Pressable>
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
          contentContainerStyle={{
            paddingTop: headerHeight,
            paddingBottom: uiStore.bottomBarHeight,
          }}
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
