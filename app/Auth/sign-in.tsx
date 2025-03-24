import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { API_BASE_URL } from "@/config/config";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleIcon } from "@/assets/icons/SVGIcons";
import D20DieAnimation from "@/components/DieRollAnim";
import { Text } from "@/components/Themed";
import { useHeaderHeight } from "@react-navigation/elements";
import { wait } from "@/utility/functions/misc";
import { useRootStore } from "@/hooks/stores";
import { tw, useStyles } from "@/hooks/styles";
import React from "react";
import { runInAction } from "mobx";
import Colors from "@/constants/Colors";
import { useVibration } from "@/hooks/generic";
import { useScaling } from "@/hooks/scaling";

const SignInScreen = observer(() => {
  const { authStore, uiStore } = useRootStore();
  const styles = useStyles();
  const theme = Colors[uiStore.colorScheme];
  const router = useRouter();
  const vibration = useVibration();
  const { getNormalizedSize, getNormalizedLineSize } = useScaling();

  const [trackedLength, setTrackedLength] = useState<number>(0);
  const [isAutofilled, setIsAutofilled] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const header = useHeaderHeight();
  const [usingEmail, setUsingEmail] = useState(false);

  useEffect(() => {
    if (password.length !== trackedLength + 1) {
      setIsAutofilled(true);
    } else {
      setTrackedLength(password.length);
    }
  }, [password]);

  const attemptLogin = async () => {
    setAwaitingResponse(true);
    const data = { email: emailAddress, password: password };
    try {
      const res = await fetch(`${API_BASE_URL}/email/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          setError(result.message || "Bad request. Please check your input.");
        } else if (res.status === 500) {
          setError(
            "An internal server error occurred. Please try again later.",
          );
        } else {
          if (result.message === "Email not yet verified!") {
            fetch(`${API_BASE_URL}/email/refresh/verification`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: emailAddress }),
            });
            setError(
              result.message + " A new verification email has been sent",
            );
          } else {
            setError(result.message || "An unexpected error occurred.");
          }
        }
        return;
      } else {
        if (result.success) {
          await authStore.login({
            token: result.token,
            email: result.email,
            provider: "email",
          });
          wait(500).then(() => {
            router.dismissAll();
            router.push("/Options");
          });
        } else {
          setError("Login failed for an unknown reason.");
        }
      }
    } catch (e) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setAwaitingResponse(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAwaitingResponse(true);
    try {
      await authStore.googleSignIn();
      router.dismissAll();
      router.push("/Options");
    } catch (e) {
      setError("Failed to sign in with Google. Please try again.");
    }
    setAwaitingResponse(false);
  };

  const handleAppleSignIn = async () => {
    setAwaitingResponse(true);
    try {
      await authStore.appleSignIn();
      router.dismissAll();
      router.push("/Options");
    } catch (e) {
      setError("Failed to sign in with Apple. Please try again.");
    }
    setAwaitingResponse(false);
  };

  return awaitingResponse ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <D20DieAnimation keepRolling={true} />
    </View>
  ) : (
    <>
      <View style={{ flex: 1 }}>
        {error && (
          <Text
            style={{
              ...styles.textCenter,
              ...styles.px6,
              color: theme.error,
            }}
          >
            {error}
          </Text>
        )}
        {usingEmail ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={header}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessibilityRole="none"
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={{ flex: 1, ...styles.columnCenter }}>
                  <View style={{ width: "75%", ...styles.pt6, ...styles.pb16 }}>
                    <Text
                      style={{
                        ...styles.textCenter,
                        ...styles["text-3xl"],
                        ...styles.pt4,
                      }}
                    >
                      Email Login
                    </Text>
                    <TextInput
                      style={styles.authInput}
                      placeholderTextColor={theme.secondary}
                      autoComplete={"email"}
                      inputMode={"email"}
                      onChangeText={setEmailAddress}
                      placeholder={"Enter Email Address..."}
                      autoCorrect={false}
                      autoCapitalize={"none"}
                      value={emailAddress}
                    />
                    <TextInput
                      style={styles.authInput}
                      placeholderTextColor={theme.secondary}
                      onChangeText={setPassword}
                      placeholder={"Enter Password..."}
                      autoComplete={"current-password"}
                      autoCorrect={false}
                      autoCapitalize={"none"}
                      secureTextEntry
                      value={password}
                    />
                    <GenericRaisedButton
                      disabled={
                        password.length == 0 || emailAddress.length == 0
                      }
                      onPress={attemptLogin}
                      backgroundColor={theme.interactive}
                      textColor={"white"}
                    >
                      Sign In
                    </GenericRaisedButton>
                    <Pressable
                      onPress={() => {
                        setUsingEmail(false);
                        vibration({ essential: true, style: "medium" });
                      }}
                      style={{ alignSelf: "center" }}
                    >
                      <Text
                        style={{
                          textDecorationLine: "underline",
                          color: Colors[uiStore.colorScheme].tabIconSelected,
                        }}
                      >
                        Use a provider instead
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        ) : (
          <View
            style={{
              flex: 1,
              ...styles.columnCenter,
            }}
          >
            <Pressable
              onPress={handleGoogleSignIn}
              style={styles.providerButton}
            >
              <Text style={[styles["text-xl"], tw.pr1]}>
                Sign in with Google
              </Text>
              <GoogleIcon
                height={getNormalizedSize(20)}
                width={getNormalizedSize(20)}
              />
            </Pressable>
            {Platform.OS == "ios" && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  uiStore.colorScheme == "dark"
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={5}
                style={{
                  width: getNormalizedSize(230),
                  height: getNormalizedLineSize(48),
                }}
                onPress={handleAppleSignIn}
              />
            )}
            <GenericRaisedButton
              onPress={() => setUsingEmail(true)}
              backgroundColor={"#2563eb"}
              style={{ width: getNormalizedSize(230) }}
              buttonStyle={{ borderRadius: 5 }}
            >
              <Text
                style={{
                  ...styles["text-xl"],
                  textAlign: "center",
                  color: "white",
                }}
              >
                Email
              </Text>
            </GenericRaisedButton>
          </View>
        )}
        <Pressable
          onPress={() => {
            runInAction(
              () => (uiStore.webviewURL = "privacy-policy/life-and-lineage"),
            );
            router.push("/FrenoDotMeWebview");
          }}
          style={{ paddingBottom: 6 }}
        >
          <Text
            style={[
              styles["text-xl"],
              {
                color: Colors[uiStore.colorScheme].tabIconSelected,
                textDecorationLine: "underline",
                textAlign: "center",
              },
            ]}
          >
            Privacy Policy
          </Text>
        </Pressable>
      </View>
    </>
  );
});

export default SignInScreen;
