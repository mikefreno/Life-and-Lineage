import { ScrollView, View } from "react-native";
import { CharacterImage } from "../../components/CharacterImage";
import shopObjects from "../../assets/json/shops.json";
import { Link } from "expo-router";
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
import { EXPANDED_PAD } from "../../components/PlayerStatus";

const ShopsScreen = observer(() => {
  const vibration = useVibration();
  const { shopsStore, uiStore } = useRootStore();
  const [isReady, setIsReady] = useState(false);

  const runDeathChecks = () => {
    shopsStore?.shopsMap.forEach((shop) => shop.deathCheck());
  };

  useEffect(() => {
    if (!isReady) {
      runDeathChecks();
      setIsReady(true);
    }
  }, []);

  const headerHeight = useHeaderHeight();
  const bottomHeight = useBottomTabBarHeight();

  const renderItem = (shop: Shop) => {
    const shopColors = shopObjects.find(
      (shopObj) => shopObj.type == shop.archetype,
    )?.colors;
    return (
      <View className="h-96 w-1/2" key={shop.shopKeeper.id}>
        <View
          className={`m-2 flex-1 items-center justify-between rounded-xl border p-4 android:elevation-4 shadow-[${shopColors?.background}]/50`}
          style={{
            backgroundColor: shopColors?.lightbackground,
            borderColor: shopColors?.background,
            elevation: 4,
          }}
        >
          <Text
            className="text-center text-2xl"
            style={{
              color: shopObjects.find(
                (shopObj) => shopObj.type == shop.archetype,
              )?.colors.font,
            }}
          >
            The {toTitleCase(shop.archetype)}
          </Text>
          <View className="items-center">
            <CharacterImage character={shop.shopKeeper} />
            <Text
              className="text-center"
              style={{
                color: shopColors?.font,
              }}
            >
              {shop.shopKeeper.fullName}
            </Text>
            <Link
              className="mt-2 active:scale-95 active:opacity-50"
              href={`/Shops/${shop.archetype}`}
              onPressIn={() => vibration({ style: "light" })}
              suppressHighlighting
              style={{}}
            >
              <View
                className="px-8 py-3 rounded-lg"
                style={{
                  shadowColor: shopColors?.background,
                  elevation: 2,
                  backgroundColor: shopColors?.background,
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                }}
              >
                <Text
                  className="text-lg"
                  style={{
                    color: shopColors?.font,
                  }}
                >
                  Enter
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.shops}
        isFocused={useIsFocused()}
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
          scrollIndicatorInsets={{ top: 120, right: 0, left: 0, bottom: 48 }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              paddingBottom:
                bottomHeight +
                (uiStore.playerStatusIsCompact ? 0 : EXPANDED_PAD),
              paddingTop: headerHeight,
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
