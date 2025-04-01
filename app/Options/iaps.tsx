import { ScrollView, View } from "react-native";
import { Text } from "@/components/Themed";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import ThemedCard from "@/components/ThemedCard";
import {
  NecromancerPaywall,
  RangerPaywall,
  RemoteSavePaywall,
  DualPaywall,
  StashPaywall,
  IAP_MODAL_ANIM_TIMING,
} from "@/components/IAPPaywalls";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import GenericStrikeAround from "@/components/GenericStrikeAround";

const InAppPurchasePage = observer(() => {
  const { uiStore, iapStore } = useRootStore();
  const styles = useStyles();
  const [showNecromancerPurchase, setShowNecromancerPurchase] =
    useState<boolean>(false);
  const [showRangerPurchase, setShowRangerPurchase] = useState<boolean>(false);
  const [showDualPurchase, setShowDualPurchase] = useState<boolean>(false);
  const [showRemoteSavePurchase, setShowRemoteSavePurchase] =
    useState<boolean>(false);

  const [showStashPurchase, setShowStashPurchase] = useState<boolean>(false);

  return (
    <ScrollView>
      <NecromancerPaywall
        isVisibleCondition={showNecromancerPurchase}
        onClose={() => setShowNecromancerPurchase(false)}
        dualToggle={() => {
          setShowNecromancerPurchase(false);
          setTimeout(
            () => setShowDualPurchase(true),
            IAP_MODAL_ANIM_TIMING + 50,
          );
        }}
      />
      <RangerPaywall
        isVisibleCondition={showRangerPurchase}
        onClose={() => setShowRangerPurchase(false)}
        dualToggle={() => {
          setShowRangerPurchase(false);
          setTimeout(
            () => setShowDualPurchase(true),
            IAP_MODAL_ANIM_TIMING + 50,
          );
        }}
      />
      <DualPaywall
        isVisibleCondition={showDualPurchase}
        onClose={() => setShowDualPurchase(false)}
      />
      <RemoteSavePaywall
        isVisibleCondition={showRemoteSavePurchase}
        onClose={() => setShowRemoteSavePurchase(false)}
      />
      <StashPaywall
        isVisibleCondition={showStashPurchase}
        onClose={() => setShowStashPurchase(false)}
      />
      <View
        style={{
          paddingHorizontal: uiStore.dimensions.width * 0.05,
          flex: 1,
          alignItems: "center",
        }}
      >
        <GenericStrikeAround
          containerStyles={{ paddingVertical: 12 }}
          style={[styles["text-2xl"], { textAlign: "center" }]}
        >
          All purchases will unlock remote saves
        </GenericStrikeAround>
        <ThemedCard style={{ width: "100%" }}>
          <Text style={{ ...styles["text-lg"], textAlign: "center" }}>
            Unlock both the Ranger and the Necromancer{"\n"}{" "}
            {iapStore.dualClassProduct?.priceString ?? "$2.99(USD)"}
          </Text>
          <GenericRaisedButton
            onPress={() => setShowDualPurchase(true)}
            disabled={iapStore.necromancerUnlocked || iapStore.rangerUnlocked}
            childrenWhenDisabled={
              iapStore.necromancerUnlocked && iapStore.rangerUnlocked
                ? "Purchased, Thanks!"
                : "One class already purchased!"
            }
          >
            Purchase Both
          </GenericRaisedButton>
        </ThemedCard>
        <ThemedCard style={{ width: "100%" }}>
          <Text style={[styles["text-lg"], { textAlign: "center" }]}>
            Unlock the Ranger Or the Necromancer{"\n"}
            {iapStore.rangerProduct?.priceString ??
              iapStore.necromancerProduct?.priceString ??
              "$1.99(USD)"}
          </Text>
          <GenericRaisedButton
            onPress={() => setShowNecromancerPurchase(true)}
            disabled={iapStore.necromancerUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase Necromancer
          </GenericRaisedButton>
          <GenericRaisedButton
            onPress={() => setShowRangerPurchase(true)}
            disabled={iapStore.rangerUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase Ranger
          </GenericRaisedButton>
        </ThemedCard>
        <ThemedCard style={{ width: "100%" }}>
          <Text style={[styles["text-lg"], { textAlign: "center" }]}>
            Add 4 additional stash tabs{"\n"}
            {iapStore.stashProduct?.priceString ?? "$1.49(USD)"}
          </Text>
          <GenericRaisedButton onPress={() => setShowStashPurchase(true)}>
            Purchase
          </GenericRaisedButton>
          {iapStore.purchasedTabs > 0 && (
            <Text style={{ textAlign: "center" }}>
              You have {iapStore.purchasedTabs} unlocked
            </Text>
          )}
        </ThemedCard>
        <ThemedCard style={{ width: "100%" }}>
          <Text style={[styles["text-lg"], { textAlign: "center" }]}>
            Unlock remote saves{"\n"}
            {iapStore.remoteSaveProduct?.priceString ?? "$0.99(USD)"}
          </Text>
          <GenericRaisedButton
            onPress={() => setShowRemoteSavePurchase(true)}
            disabled={iapStore.remoteSavesUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase
          </GenericRaisedButton>
        </ThemedCard>
      </View>
    </ScrollView>
  );
});
export default InAppPurchasePage;
