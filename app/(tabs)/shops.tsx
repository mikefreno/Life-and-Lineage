import React, { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { CharacterImage } from "@/components/CharacterImage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import TutorialModal from "@/components/TutorialModal";
import { toTitleCase } from "@/utility/functions/misc";
import { TutorialOption } from "@/utility/types";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "@/components/Themed";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { type Shop } from "@/entities/shop";
import { shopColors } from "@/constants/Colors";
import { useStyles } from "@/hooks/styles";

const ShopsScreen = observer(() => {
  const vibration = useVibration();
  const { shopsStore, uiStore } = useRootStore();
  const [isReady, setIsReady] = useState(false);
  const styles = useStyles();
  const router = useRouter();

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
              shadowColor: colors.background,
              shadowOpacity: 0.35,
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
            }}
          >
            <View
              style={{
                width: uiStore.dimensions.lesser * 0.4,
                height: uiStore.dimensions.lesser * 0.4,
                alignSelf: "center",
              }}
            >
              <CharacterImage character={shop.shopKeeper} />
            </View>
            <Text
              style={[
                styles["text-lg"],
                { textAlign: "center", color: colors.text },
              ]}
            >
              {shop.shopKeeper.fullName.replaceAll(" ", "\n")}
            </Text>
          </View>

          <Pressable
            style={{
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

  const topViewStyle = useMemo(() => {
    return {
      paddingTop: uiStore.headerHeight,
      paddingBottom: uiStore.compactRoutePadding,
      ...styles.notchAvoidingLanscapeMargin,
    };
  }, [
    uiStore.playerStatusExpandedOnAllRoutes,
    uiStore.playerStatusCompactHeight,
    uiStore.headerHeight,
    uiStore.orientation,
  ]);

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
        <ScrollView contentContainerStyle={topViewStyle}>
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
