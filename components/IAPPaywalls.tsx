import { useRootStore } from "@/hooks/stores";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, ViewStyle } from "react-native";
import Modal from "react-native-modal";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStyles } from "@/hooks/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Text } from "./Themed";
import { useVibration } from "@/hooks/generic";
import Purchases from "react-native-purchases";
import GenericRaisedButton from "./GenericRaisedButton";
import {
  ArcaneIcon,
  AssassinationIcon,
  BeastMasteryIcon,
  BloodDrop,
  Bones,
  NecromancerSkull,
  Pestilence,
  RangerIcon,
  SummonerSkull,
} from "@/assets/icons/SVGIcons";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { useScaling } from "@/hooks/scaling";
import GenericModal from "./GenericModal";
import { observer } from "mobx-react-lite";
import D20DieAnimation from "./DieRollAnim";
import { runInAction } from "mobx";
import React from "react";

export const NecromancerPaywall = observer(
  ({
    isVisibleCondition,
    onClose,
    dualToggle,
  }: {
    isVisibleCondition: boolean;
    onClose: () => void;
    dualToggle: (() => void) | undefined;
  }) => {
    const { uiStore, iapStore, authStore } = useRootStore();
    const styles = useStyles();
    const { getNormalizedSize } = useScaling();

    const [reAttemptingProductGet, setReAttemptingProductGet] =
      useState<boolean>(false);
    const [noProductErrorReport, setNoProductErrorReport] =
      useState<string>("");
    const [purchaseError, setPurchaseError] = useState<string>("");
    const [purchaseSuccess, setPurchaseSuccess] = useState<string>("");
    const vibration = useVibration();

    useEffect(() => {
      if (!iapStore.necromancerProduct) {
        if (authStore.isConnected) {
          //reattempt product get
          setReAttemptingProductGet(true);
          Purchases.getOfferings()
            .then((val) => iapStore.setOffering(val.current))
            .catch(() =>
              setNoProductErrorReport(
                "Failed to retrieve product offerings, make sure you are connected to the interet",
              ),
            )
            .finally(() => setReAttemptingProductGet(false));
        } else {
          setNoProductErrorReport("Need Internet Connection");
        }
      }
    }, [iapStore.necromancerProduct, authStore.isConnected]);

    const spinValue = useRef(new Animated.Value(0)).current;

    const roll = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      }).start(() => {
        roll();
      });
    };

    useEffect(() => {
      if (isVisibleCondition && !uiStore.reduceMotion) {
        roll();
      }
    }, [isVisibleCondition, uiStore.reduceMotion]);

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "720deg"],
    });

    const animatedStyle = { transform: [{ rotateY: spin }] };

    if (!iapStore.necromancerProduct) {
      return (
        <GenericModal
          isVisibleCondition={isVisibleCondition}
          backFunction={onClose}
        >
          {reAttemptingProductGet ? (
            <View>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                Attempting Product Retrieval...
              </Text>

              <D20DieAnimation showNumber={false} keepRolling />
            </View>
          ) : (
            <View>
              <GenericStrikeAround style={styles["text-2xl"]}>
                ERROR
              </GenericStrikeAround>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                {noProductErrorReport}
              </Text>
            </View>
          )}
        </GenericModal>
      );
    }

    const requestNecromancerPurchase = async () => {
      if (!iapStore.necromancerProduct) return false;

      return Purchases.purchaseStoreProduct(iapStore.necromancerProduct)
        .then((val) => {
          const res = iapStore.purchaseHandler(val);
          if (res) {
            setPurchaseError("");
            setPurchaseSuccess(res);
            vibration({ style: "success", essential: true });
            setTimeout(() => onClose(), 1500);
            return true;
          }
          setPurchaseError(
            "An unknown error occured! If needed, contact: michael@freno.me",
          );
          return false;
        })
        .catch((e) => {
          if (e.toString() !== "Error: Purchase was cancelled.") {
            if (authStore.isConnected) {
              setPurchaseError(
                "An unknown error occured! If needed, contact: michael@freno.me",
              );
            } else {
              setPurchaseError("Internet Connection Required");
            }
          }
          return false;
        });
    };

    return (
      <IAPModal
        isVisibleCondition={isVisibleCondition}
        backFunction={onClose}
        handlePurchaseRequest={requestNecromancerPurchase}
        priceString={iapStore.necromancerProduct.priceString}
        purchaseError={purchaseError}
        purchaseSuccess={purchaseSuccess}
        dualToggle={dualToggle}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={[
              styles["text-3xl"],
              {
                letterSpacing: 3,
                color: "white",
              },
            ]}
          >
            Necromancer Unlock
          </Text>
          <Animated.View
            style={{
              justifyContent: "center",
              alignItems: "center",
              ...animatedStyle,
            }}
          >
            <NecromancerSkull />
          </Animated.View>
          <GenericStrikeAround
            containerStyles={{
              width: "80%",
            }}
            style={{
              paddingVertical: getNormalizedSize(16),
              color: "white",
              ...styles["text-xl"],
            }}
          >
            Schools
          </GenericStrikeAround>
          <View
            style={[
              styles.columnCenter,
              { marginHorizontal: "auto", width: "100%" },
            ]}
          >
            <View style={[styles.rowEvenly, { width: "80%" }]}>
              <BloodDrop height={80} width={80} />
              <Pestilence height={80} width={80} />
            </View>
            <View style={[styles.rowEvenly, { width: "80%" }]}>
              <SummonerSkull height={80} width={80} />
              <Bones height={80} width={80} />
            </View>
          </View>
        </View>
      </IAPModal>
    );
  },
);

export const RangerPaywall = observer(
  ({
    isVisibleCondition,
    onClose,
    dualToggle,
  }: {
    isVisibleCondition: boolean;
    onClose: () => void;
    dualToggle: (() => void) | undefined;
  }) => {
    const { uiStore, iapStore, authStore } = useRootStore();
    const styles = useStyles();
    const { getNormalizedSize } = useScaling();
    const vibration = useVibration();

    const [reAttemptingProductGet, setReAttemptingProductGet] =
      useState<boolean>(false);
    const [noProductErrorReport, setNoProductErrorReport] = useState<string>(
      "Product does not yet exist",
    );
    const [purchaseError, setPurchaseError] = useState<string>("");
    const [purchaseSuccess, setPurchaseSuccess] = useState<string>("");

    useEffect(() => {
      if (!iapStore.rangerProduct) {
        if (authStore.isConnected) {
          //reattempt product get
          setReAttemptingProductGet(true);
          Purchases.getOfferings()
            .then((val) => iapStore.setOffering(val.current))
            .catch(() =>
              setNoProductErrorReport(
                "Failed to retrieve product offerings, make sure you are connected to the interet",
              ),
            )
            .finally(() => setReAttemptingProductGet(false));
        } else {
          setNoProductErrorReport("Need Internet Connection");
        }
      }
    }, [iapStore.rangerProduct, authStore.isConnected]);

    const spinValue = useRef(new Animated.Value(0)).current;

    const roll = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      }).start(() => {
        roll();
      });
    };

    useEffect(() => {
      if (isVisibleCondition && !uiStore.reduceMotion) {
        roll();
      }
    }, [isVisibleCondition, uiStore.reduceMotion]);

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "720deg"],
    });

    const animatedStyle = { transform: [{ rotateY: spin }] };

    if (!iapStore.rangerProduct) {
      return (
        <GenericModal
          isVisibleCondition={isVisibleCondition}
          backFunction={onClose}
        >
          {reAttemptingProductGet ? (
            <View>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                Attempting Product Retrieval...
              </Text>

              <D20DieAnimation showNumber={false} keepRolling />
            </View>
          ) : (
            <View>
              <GenericStrikeAround style={styles["text-2xl"]}>
                ERROR
              </GenericStrikeAround>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                {noProductErrorReport}
              </Text>
              {noProductErrorReport === "Product does not yet exist" ? (
                <GenericRaisedButton
                  onPress={() => {
                    runInAction(() => (iapStore.rangerUnlocked = true));
                    setTimeout(() => onClose(), 1500);
                  }}
                >
                  Temporary Override
                </GenericRaisedButton>
              ) : null}
            </View>
          )}
        </GenericModal>
      );
    }

    const requestRangerPurchase = async () => {
      if (!iapStore.rangerProduct) return false;

      return Purchases.purchaseStoreProduct(iapStore.rangerProduct)
        .then((val) => {
          const res = iapStore.purchaseHandler(val);
          if (res) {
            setPurchaseError("");
            setPurchaseSuccess(res);
            vibration({ style: "success", essential: true });
            setTimeout(() => onClose(), 1500);
            return true;
          }
          setPurchaseError(
            "An unknown error occured! If needed, contact: michael@freno.me",
          );
          return false;
        })
        .catch((e) => {
          if (e.toString() !== "Error: Purchase was cancelled.") {
            if (authStore.isConnected) {
              setPurchaseError(
                "An unknown error occured! If needed, contact: michael@freno.me",
              );
            } else {
              setPurchaseError("Internet Connection Required");
            }
          }
          return false;
        });
    };

    return (
      <IAPModal
        isVisibleCondition={isVisibleCondition}
        backFunction={onClose}
        handlePurchaseRequest={requestRangerPurchase}
        priceString={iapStore.rangerProduct.priceString}
        purchaseError={purchaseError}
        purchaseSuccess={purchaseSuccess}
        dualToggle={dualToggle}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={[
              styles["text-3xl"],
              {
                letterSpacing: 3,
                color: "white",
              },
            ]}
          >
            Ranger Unlock
          </Text>
          <Animated.View
            style={{
              justifyContent: "center",
              alignItems: "center",
              ...animatedStyle,
            }}
          >
            <RangerIcon />
          </Animated.View>

          <GenericStrikeAround
            containerStyles={{
              width: "80%",
            }}
            style={{
              paddingVertical: getNormalizedSize(16),
              color: "white",
              ...styles["text-xl"],
            }}
          >
            Schools
          </GenericStrikeAround>
          <View
            style={[
              styles.columnCenter,
              { marginHorizontal: "auto", width: "100%" },
            ]}
          >
            <View style={[styles.rowEvenly, { width: "80%" }]}>
              <AssassinationIcon height={80} width={80} />
              <BeastMasteryIcon height={80} width={80} />
            </View>
            <View style={[styles.rowEvenly, { width: "80%" }]}>
              <ArcaneIcon height={80} width={80} />
            </View>
          </View>
        </View>
      </IAPModal>
    );
  },
);

export const DualPaywall = observer(
  ({
    isVisibleCondition,
    onClose,
  }: {
    isVisibleCondition: boolean;
    onClose: () => void;
  }) => {
    const { iapStore, authStore } = useRootStore();
    const styles = useStyles();
    const { getNormalizedSize } = useScaling();
    const vibration = useVibration();

    const [reAttemptingProductGet, setReAttemptingProductGet] =
      useState<boolean>(false);
    const [noProductErrorReport, setNoProductErrorReport] = useState<string>(
      "Product does not yet exist",
    );
    const [purchaseError, setPurchaseError] = useState<string>("");
    const [purchaseSuccess, setPurchaseSuccess] = useState<string>("");

    useEffect(() => {
      if (!iapStore.dualClassProduct) {
        if (authStore.isConnected) {
          //reattempt product get
          setReAttemptingProductGet(true);
          Purchases.getOfferings()
            .then((val) => iapStore.setOffering(val.current))
            .catch(() =>
              setNoProductErrorReport(
                "Failed to retrieve product offerings, make sure you are connected to the interet",
              ),
            )
            .finally(() => setReAttemptingProductGet(false));
        } else {
          setNoProductErrorReport("Need Internet Connection");
        }
      }
    }, [iapStore.dualClassProduct, authStore.isConnected]);

    if (!iapStore.dualClassProduct) {
      return (
        <GenericModal
          isVisibleCondition={isVisibleCondition}
          backFunction={onClose}
        >
          {reAttemptingProductGet ? (
            <View>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                Attempting Product Retrieval...
              </Text>

              <D20DieAnimation showNumber={false} keepRolling />
            </View>
          ) : (
            <View>
              <GenericStrikeAround style={styles["text-2xl"]}>
                ERROR
              </GenericStrikeAround>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                {noProductErrorReport}
              </Text>
              {noProductErrorReport === "Product does not yet exist" ? (
                <GenericRaisedButton
                  onPress={() => {
                    runInAction(() => {
                      iapStore.rangerUnlocked = true;
                      iapStore.necromancerUnlocked = true;
                    });
                    setTimeout(() => onClose(), 1500);
                  }}
                >
                  Temporary Override
                </GenericRaisedButton>
              ) : null}
            </View>
          )}
        </GenericModal>
      );
    }

    const requestDualClassPurchase = async () => {
      if (!iapStore.dualClassProduct) return false;

      return await Purchases.purchaseStoreProduct(iapStore.dualClassProduct)
        .then((val) => {
          const res = iapStore.purchaseHandler(val);
          if (res) {
            setPurchaseError("");
            setPurchaseSuccess(res);
            vibration({ style: "success", essential: true });
            setTimeout(() => onClose(), 1500);
            return true;
          }
          setPurchaseError(
            "An unknown error occured! If needed, contact: michael@freno.me",
          );
          return false;
        })
        .catch((e) => {
          if (e.toString() !== "Error: Purchase was cancelled.") {
            if (authStore.isConnected) {
              setPurchaseError(
                "An unknown error occured! If needed, contact: michael@freno.me",
              );
            } else {
              console.error(e);
              setPurchaseError("Internet Connection Required");
            }
          }
          return false;
        });
    };

    return (
      <IAPModal
        isVisibleCondition={isVisibleCondition}
        backFunction={onClose}
        handlePurchaseRequest={requestDualClassPurchase}
        priceString={iapStore.dualClassProduct.priceString}
        purchaseError={purchaseError}
        purchaseSuccess={purchaseSuccess}
        isDual
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={[
              styles["text-3xl"],
              {
                letterSpacing: 3,
                color: "white",
              },
            ]}
          >
            Dual Class Unlock
          </Text>

          <Text
            style={[
              styles["text-xl"],
              {
                letterSpacing: 3,
                color: "white",
              },
            ]}
          >
            Ranger
          </Text>
          <RangerIcon />
          <GenericStrikeAround
            containerStyles={{
              width: "80%",
            }}
            style={{
              paddingVertical: getNormalizedSize(16),
              color: "white",
              ...styles["text-xl"],
            }}
          >
            Schools
          </GenericStrikeAround>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <AssassinationIcon height={80} width={80} />
            <BeastMasteryIcon height={80} width={80} />
            <ArcaneIcon height={80} width={80} />
          </ScrollView>
          <Text
            style={{
              paddingVertical: 12,
              ...styles["text-5xl"],
              color: "white",
            }}
          >
            &
          </Text>
          <Text
            style={[
              styles["text-xl"],
              {
                letterSpacing: 3,
                color: "white",
                paddingTop: 8,
              },
            ]}
          >
            Necromancer
          </Text>
          <NecromancerSkull />
          <GenericStrikeAround
            containerStyles={{
              width: "80%",
            }}
            style={{
              paddingVertical: getNormalizedSize(16),
              color: "white",
              ...styles["text-xl"],
            }}
          >
            Schools
          </GenericStrikeAround>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <BloodDrop height={80} width={80} />
            <Pestilence height={80} width={80} />
            <SummonerSkull height={80} width={80} />
            <Bones height={80} width={80} />
          </ScrollView>
        </View>
      </IAPModal>
    );
  },
);

export const RemoteSavePaywall = observer(
  ({
    isVisibleCondition,
    onClose,
  }: {
    isVisibleCondition: boolean;
    onClose: () => void;
  }) => {
    const { iapStore, authStore } = useRootStore();
    const styles = useStyles();
    const vibration = useVibration();

    const [reAttemptingProductGet, setReAttemptingProductGet] =
      useState<boolean>(false);
    const [noProductErrorReport, setNoProductErrorReport] = useState<string>(
      "Product does not yet exist",
    );
    const [purchaseError, setPurchaseError] = useState<string>("");
    const [purchaseSuccess, setPurchaseSuccess] = useState<string>("");

    useEffect(() => {
      if (!iapStore.remoteSaveProduct) {
        if (authStore.isConnected) {
          //reattempt product get
          setReAttemptingProductGet(true);
          Purchases.getOfferings()
            .then((val) => iapStore.setOffering(val.current))
            .catch(() =>
              setNoProductErrorReport(
                "Failed to retrieve product offerings, make sure you are connected to the interet",
              ),
            )
            .finally(() => setReAttemptingProductGet(false));
        } else {
          setNoProductErrorReport("Need Internet Connection");
        }
      }
    }, [iapStore.remoteSaveProduct, authStore.isConnected]);

    if (!iapStore.remoteSaveProduct) {
      return (
        <GenericModal
          isVisibleCondition={isVisibleCondition}
          backFunction={onClose}
        >
          {reAttemptingProductGet ? (
            <View>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                Attempting Product Retrieval...
              </Text>

              <D20DieAnimation showNumber={false} keepRolling />
            </View>
          ) : (
            <View>
              <GenericStrikeAround style={styles["text-2xl"]}>
                ERROR
              </GenericStrikeAround>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                {noProductErrorReport}
              </Text>
              {noProductErrorReport === "Product does not yet exist" ? (
                <GenericRaisedButton
                  onPress={() => {
                    runInAction(() => {
                      iapStore.remoteSaveSpecificUnlock = true;
                    });
                    setTimeout(() => onClose(), 1500);
                  }}
                >
                  Temporary Override
                </GenericRaisedButton>
              ) : null}
            </View>
          )}
        </GenericModal>
      );
    }

    const requestRemoteSavePurchase = async () => {
      if (!iapStore.remoteSaveProduct) return false;

      return Purchases.purchaseStoreProduct(iapStore.remoteSaveProduct)
        .then((val) => {
          const res = iapStore.purchaseHandler(val);
          if (res) {
            setPurchaseError("");
            setPurchaseSuccess(res);
            vibration({ style: "success", essential: true });
            setTimeout(() => onClose(), 1500);
            return true;
          }
          setPurchaseError(
            "An unknown error occured! If needed, contact: michael@freno.me",
          );
          return false;
        })
        .catch((e) => {
          if (e.toString() !== "Error: Purchase was cancelled.") {
            if (authStore.isConnected) {
              setPurchaseError(
                "An unknown error occured! If needed, contact: michael@freno.me",
              );
            } else {
              setPurchaseError("Internet Connection Required");
            }
          }
          return false;
        });
    };

    return (
      <IAPModal
        isVisibleCondition={isVisibleCondition}
        backFunction={onClose}
        handlePurchaseRequest={requestRemoteSavePurchase}
        priceString={iapStore.remoteSaveProduct.priceString}
        purchaseError={purchaseError}
        purchaseSuccess={purchaseSuccess}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={[
              styles["text-3xl"],
              {
                letterSpacing: 3,
                color: "white",
              },
            ]}
          >
            Remote Save Unlock
          </Text>
          <Image
            source={require("@/meta-assets/cloud_save_game.png")}
            style={{ height: 200, width: 200 }}
            contentFit={"contain"}
          />
          <Text
            style={[
              styles["text-xl"],
              {
                color: "#e5e7eb",
              },
            ]}
          >
            Allows for cross device/platform saves
          </Text>
        </View>
      </IAPModal>
    );
  },
);

export const StashPaywall = observer(
  ({
    isVisibleCondition,
    onClose,
  }: {
    isVisibleCondition: boolean;
    onClose: () => void;
  }) => {
    const { iapStore, authStore } = useRootStore();
    const styles = useStyles();
    const vibration = useVibration();

    const [reAttemptingProductGet, setReAttemptingProductGet] =
      useState<boolean>(false);
    const [noProductErrorReport, setNoProductErrorReport] = useState<string>(
      "Product does not yet exist",
    );
    const [purchaseError, setPurchaseError] = useState<string>("");
    const [purchaseSuccess, setPurchaseSuccess] = useState<string>("");

    useEffect(() => {
      if (!iapStore.stashProduct) {
        if (authStore.isConnected) {
          //reattempt product get
          setReAttemptingProductGet(true);
          Purchases.getOfferings()
            .then((val) => iapStore.setOffering(val.current))
            .catch(() =>
              setNoProductErrorReport(
                "Failed to retrieve product offerings, make sure you are connected to the interet",
              ),
            )
            .finally(() => setReAttemptingProductGet(false));
        } else {
          setNoProductErrorReport("Need Internet Connection");
        }
      }
    }, [iapStore.stashProduct, authStore.isConnected]);

    if (!iapStore.stashProduct) {
      return (
        <GenericModal
          isVisibleCondition={isVisibleCondition}
          backFunction={onClose}
        >
          {reAttemptingProductGet ? (
            <View>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                Attempting Product Retrieval...
              </Text>

              <D20DieAnimation showNumber={false} keepRolling />
            </View>
          ) : (
            <View>
              <GenericStrikeAround style={styles["text-2xl"]}>
                ERROR
              </GenericStrikeAround>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                {noProductErrorReport}
              </Text>
              {noProductErrorReport === "Product does not yet exist" ? (
                <GenericRaisedButton
                  onPress={() => {
                    runInAction(() => {
                      iapStore.purchasedTabs += 4;
                    });
                    setTimeout(() => onClose(), 1500);
                  }}
                >
                  Temporary Override
                </GenericRaisedButton>
              ) : null}
            </View>
          )}
        </GenericModal>
      );
    }

    const requestStashPurchase = async () => {
      if (!iapStore.stashProduct) return false;

      return Purchases.purchaseStoreProduct(iapStore.stashProduct)
        .then((val) => {
          const res = iapStore.purchaseHandler(val);
          if (res) {
            setPurchaseError("");
            setPurchaseSuccess(res);
            vibration({ style: "success", essential: true });
            setTimeout(() => onClose(), 1500);
            return true;
          }
          setPurchaseError(
            "An unknown error occured! If needed, contact: michael@freno.me",
          );
          return false;
        })
        .catch((e) => {
          if (e.toString() !== "Error: Purchase was cancelled.") {
            if (authStore.isConnected) {
              setPurchaseError(
                "An unknown error occured! If needed, contact: michael@freno.me",
              );
            } else {
              setPurchaseError("Internet Connection Required");
            }
          }
          return false;
        });
    };

    return (
      <IAPModal
        isVisibleCondition={isVisibleCondition}
        backFunction={onClose}
        handlePurchaseRequest={requestStashPurchase}
        priceString={iapStore.stashProduct.priceString}
        purchaseError={purchaseError}
        purchaseSuccess={purchaseSuccess}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles["text-3xl"],
              {
                letterSpacing: 3,
                color: "white",
              },
            ]}
          >
            Additional Stash Tabs(4)
          </Text>
          <Image
            source={require("@/meta-assets/stashPurchase.png")}
            style={{ height: 200, width: 200 }}
            contentFit={"scale-down"}
          />
        </View>
      </IAPModal>
    );
  },
);

export const IAPModal = observer(
  ({
    backFunction,
    isVisibleCondition,
    handlePurchaseRequest,
    children,
    priceString,
    purchaseError,
    purchaseSuccess,
    dualToggle,
    isDual = false,
  }: {
    backFunction: () => void;
    isVisibleCondition: boolean;
    handlePurchaseRequest: () => Promise<boolean>;
    children: ReactNode;
    priceString: string;
    purchaseError: string;
    purchaseSuccess: string;
    dualToggle?: () => void;
    isDual?: boolean;
  }) => {
    const { uiStore, iapStore } = useRootStore();

    const styles = useStyles();
    const insets = useSafeAreaInsets();
    const vibration = useVibration();
    const [restoreError, setRestoreError] = useState<boolean>();
    const [restoreResponse, setRestoreResponse] = useState<{
      messages: string[];
      messageColor: string;
    } | null>(null);
    const [loadingPurchase, setLoadingPurchase] = useState<boolean>();

    const handleRestorePurchase = () => {
      vibration({ style: "light" });
      Purchases.restorePurchases()
        .then((val) => {
          const res = iapStore.evaluateTransactions(
            val.nonSubscriptionTransactions,
          );
          setRestoreError(false);
          setRestoreResponse(res);
        })
        .catch(() => {
          setRestoreResponse(null);
          setRestoreError(true);
          setTimeout(() => setRestoreError(false), 5000);
        });
    };
    const handlePurchaseRequestExtended = () => {
      setLoadingPurchase(true);
      handlePurchaseRequest().then(() => setLoadingPurchase(false));
    };

    return (
      <Modal
        animationIn={uiStore.reduceMotion ? "fadeIn" : "slideInUp"}
        animationOut={uiStore.reduceMotion ? "fadeOut" : "slideOutDown"}
        animationInTiming={300}
        animationOutTiming={300}
        backdropTransitionOutTiming={300}
        backdropTransitionInTiming={300}
        backdropColor={
          Platform.OS == "ios"
            ? "#000000"
            : uiStore.colorScheme == "light"
            ? "#ffffffff"
            : "#000000"
        }
        isVisible={isVisibleCondition}
        backdropOpacity={0.5}
        onBackButtonPress={backFunction}
        statusBarTranslucent={true}
        coverScreen={true}
        deviceHeight={uiStore.dimensions.height}
        deviceWidth={uiStore.dimensions.width}
        style={{ margin: 0 }}
      >
        <PulsingGradientWrapper
          style={{
            maxHeight: uiStore.dimensions.height,
            borderRadius: 12,
            paddingTop: uiStore.insets?.top,
            paddingBottom: uiStore.insets?.bottom,
            width: "100%",
          }}
        >
          <ScrollView
            style={{
              maxHeight: uiStore.dimensions.height - insets.top - insets.bottom,
            }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: "2%",
              justifyContent: "space-between",
            }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={uiStore.isLandscape || isDual}
          >
            <View style={styles.rowBetween}>
              <Image
                style={{
                  height: uiStore.dimensions.lesser * 0.25,
                  width: uiStore.dimensions.lesser * 0.25,
                }}
                source={require("@/meta-assets/RoundedIcon.png")}
                contentFit="scale-down"
              />
              <Pressable
                onPress={() => {
                  vibration({ style: "warning", essential: true });
                  backFunction();
                }}
                style={{
                  ...styles.closeButton,
                  position: "relative",
                }}
              >
                <Text
                  style={{
                    ...styles["text-5xl"],
                    color: "white",
                  }}
                >
                  x
                </Text>
              </Pressable>
            </View>
            {children}
            {loadingPurchase ? (
              <View style={{ flex: 1, alignSelf: "center" }}>
                <D20DieAnimation keepRolling showNumber={false} />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    textAlign: "center",
                    ...styles["text-2xl"],
                    color: "#e5e7eb",
                  }}
                >
                  {priceString}
                </Text>
                <GenericRaisedButton
                  onPress={handlePurchaseRequestExtended}
                  textSize={"xl"}
                >
                  Make Purchase
                </GenericRaisedButton>
                {dualToggle &&
                !(iapStore.rangerUnlocked || iapStore.necromancerUnlocked) ? (
                  <Pressable onPress={dualToggle}>
                    <Text
                      style={[
                        styles["text-xl"],
                        { textAlign: "center", color: "#e5e7eb" },
                      ]}
                    >
                      Or purchase both classes ($2.99)
                    </Text>
                  </Pressable>
                ) : null}
                {purchaseSuccess.length > 0 ? (
                  <Text
                    style={[
                      {
                        color: "#86efac",
                        textAlign: "center",
                        letterSpacing: 3,
                      },
                      styles["text-lg"],
                    ]}
                  >
                    {purchaseSuccess}
                  </Text>
                ) : null}
                {purchaseError.length > 0 ? (
                  <Text
                    style={[
                      {
                        color: "#fca5a5",
                        textAlign: "center",
                        letterSpacing: 3,
                      },
                      styles["text-lg"],
                    ]}
                  >
                    {purchaseError}
                  </Text>
                ) : null}
                <View style={{ padding: uiStore.dimensions.height * 0.05 }}>
                  {restoreResponse
                    ? restoreResponse.messages.map((message, id) => (
                        <Text
                          key={id}
                          style={[
                            {
                              color: restoreResponse.messageColor,
                              textAlign: "center",
                            },
                            styles["text-lg"],
                          ]}
                        >
                          {message}
                        </Text>
                      ))
                    : null}
                  {restoreError ? (
                    <Text
                      style={[
                        {
                          color: "#fca5a5",
                          textAlign: "center",
                          letterSpacing: 3,
                        },
                        styles["text-lg"],
                      ]}
                    >
                      No valid receipt found.
                    </Text>
                  ) : null}
                  <Pressable
                    onPress={handleRestorePurchase}
                    style={{
                      marginHorizontal: "auto",
                      paddingTop: 12,
                    }}
                  >
                    <Text style={{ color: "#e5e7eb" }}>Restore Purchases</Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </PulsingGradientWrapper>
      </Modal>
    );
  },
);

export const PulsingGradientWrapper = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const redIntensity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(90, 26, 26, 1.0)", "rgba(128, 0, 0, 1.0)"],
  });

  return (
    <Animated.View
      style={[
        gradientStyles.container,
        { backgroundColor: redIntensity, overflow: "hidden" },
        style,
      ]}
    >
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={gradientStyles.overlay}
      />
      <View style={gradientStyles.content}>{children}</View>
    </Animated.View>
  );
};
const gradientStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
