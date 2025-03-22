import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { GoogleIcon } from "@/assets/icons/SVGIcons";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { API_BASE_URL } from "@/config/config";
import D20DieAnimation from "@/components/DieRollAnim";
import { Text } from "@/components/Themed";
import { useHeaderHeight } from "@react-navigation/elements";
import { isValidPassword } from "@/utility/functions/password";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { tw, useStyles } from "@/hooks/styles";
import { runInAction } from "mobx";
import Colors from "@/constants/Colors";
import { useScaling } from "@/hooks/scaling";

const SignUpScreen = observer(() => {
  const vibration = useVibration();
  const { authStore, uiStore } = useRootStore();
  const styles = useStyles();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [trackedLength, setTrackedLength] = useState<number>(0);
  const [passwordConf, setPasswordConf] = useState<string>("");
  const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false);
  const [shortPassword, setShortPassword] = useState<boolean>(false);
  const [simplePassword, setSimplePassword] = useState<boolean>(false);
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [isAutofilled, setIsAutofilled] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [usingEmail, setUsingEmail] = useState<boolean>(false);
  const header = useHeaderHeight();
  const { getNormalizedSize, getNormalizedLineSize } = useScaling();

  const theme = Colors[uiStore.colorScheme];

  useEffect(() => {
    if (authStore.isAuthenticated) {
      const navigateToOptions = async () => {
        router.dismissAll();
        router.push("/Options");
      };

      navigateToOptions();
    }
  }, [authStore.isAuthenticated, router]);

  useEffect(() => setError(""), [usingEmail]);

  useEffect(() => {
    if (password.length !== trackedLength + 1) {
      setIsAutofilled(true);
    } else {
      setTrackedLength(password.length);
    }
  }, [password]);

  const handleEmailSignUp = async () => {
    setError(undefined);
    setAwaitingResponse(true);
    setShortPassword(false);
    setSimplePassword(false);
    setPasswordMismatch(false);
    let invalid = false;

    if (password.length < 8) {
      setShortPassword(true);
      setAwaitingResponse(false);
      invalid = true;
    }

    if (!isValidPassword(password)) {
      setSimplePassword(true);
      setAwaitingResponse(false);
      invalid = true;
    }

    if (password !== passwordConf) {
      setPasswordMismatch(true);
      setAwaitingResponse(false);
      invalid = true;
    }

    if (invalid) return; // this pattern is to allow catching of multiple issues

    const data = {
      email: emailAddress,
      password: password,
      password_conf: passwordConf,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/email/registration`, {
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
          setError(result.message || "An unexpected error occurred.");
        }
      } else {
        if (result.success) {
          setEmailSent(true);
        } else {
          setError("Registration failed for an unknown reason.");
        }
      }
    } catch (e) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsAutofilled(false);
      setAwaitingResponse(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setAwaitingResponse(true);
    try {
      await authStore.googleSignIn();
      setAwaitingResponse(false);
    } catch (error) {
      setError("Failed to sign up with Google. Please try again.");
      setAwaitingResponse(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAwaitingResponse(true);
    try {
      await authStore.appleSignIn();
      setAwaitingResponse(false);
    } catch (error) {
      setError("Failed to sign up with Apple. Please try again.");
    }
    setAwaitingResponse(false);
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        {awaitingResponse ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <D20DieAnimation keepRolling={awaitingResponse} />
          </View>
        ) : !usingEmail ? (
          <>
            {error && (
              <Text style={{ textAlign: "center", color: "#ef4444" }}>
                {error}
              </Text>
            )}
            <View
              style={{
                flex: 1,
                ...styles.columnCenter,
              }}
            >
              <Pressable
                onPress={handleGoogleSignUp}
                style={styles.providerButton}
              >
                <Text style={[styles["text-xl"], tw.pr1]}>
                  Sign up with Google
                </Text>
                <GoogleIcon
                  height={getNormalizedSize(20)}
                  width={getNormalizedSize(20)}
                />
              </Pressable>
              {Platform.OS == "ios" && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
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
                  onPress={handleAppleSignUp}
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
          </>
        ) : !emailSent ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={header + (Platform.OS == "ios" ? 20 : 0)}
            style={{
              flex: 1,
            }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                      Email Registration
                    </Text>
                    <TextInput
                      style={styles.authInput}
                      placeholderTextColor={theme.secondary}
                      autoComplete={"email"}
                      inputMode={"email"}
                      onChangeText={(text) => setEmailAddress(text)}
                      placeholder={"Enter Email Address..."}
                      autoCorrect={false}
                      autoCapitalize={"none"}
                      value={emailAddress}
                    />
                    <View>
                      <TextInput
                        style={[
                          styles.authInput,
                          isAutofilled && { color: "black" },
                        ]}
                        placeholderTextColor={theme.secondary}
                        onChangeText={(text) => setPassword(text)}
                        placeholder={"Enter Password..."}
                        autoComplete={"new-password"}
                        autoCorrect={false}
                        autoCapitalize={"none"}
                        secureTextEntry
                        value={password}
                        passwordRules={
                          "minlength: 8; required: lower; required: upper; required: digit,[oqtu-#&'()+,./;?@]; required: [-];"
                        }
                      />
                      <Text style={{ textAlign: "center" }}>
                        Password must contain at least 8 characters, a
                        lower-case, upper-case, and either a number or special
                        character(!@$% etc.)
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.authInput,
                        isAutofilled && { color: "black" },
                      ]}
                      placeholderTextColor={theme.secondary}
                      onChangeText={(text) => setPasswordConf(text)}
                      placeholder={"Confirm Password..."}
                      autoComplete={"password-new"}
                      autoCorrect={false}
                      secureTextEntry
                      autoCapitalize={"none"}
                      value={passwordConf}
                      passwordRules={
                        "minlength: 8; required: lower; required: upper; required: digit,[oqtu-#&'()+,./;?@]; required: [-];"
                      }
                    />
                    {shortPassword && (
                      <Text style={{ textAlign: "center", color: "#ef4444" }}>
                        Password too short, must be at least 8 chars
                      </Text>
                    )}
                    {simplePassword && (
                      <Text style={{ textAlign: "center", color: "#ef4444" }}>
                        Password must contain a lower-case, upper-case, and
                        either a number or special character(!@$% etc.)
                      </Text>
                    )}
                    {passwordMismatch && (
                      <Text style={{ textAlign: "center", color: "#ef4444" }}>
                        Passwords must match!
                      </Text>
                    )}
                    {error && (
                      <Text style={{ textAlign: "center", color: "#ef4444" }}>
                        {error}
                      </Text>
                    )}
                    <GenericRaisedButton
                      disabled={
                        password.length == 0 ||
                        passwordConf.length == 0 ||
                        emailAddress.length == 0
                      }
                      onPress={handleEmailSignUp}
                      backgroundColor={theme.interactive}
                      textColor={"white"}
                    >
                      Sign Up
                    </GenericRaisedButton>
                    <Pressable
                      style={{ alignSelf: "center" }}
                      onPress={() => {
                        setUsingEmail(false);
                        vibration({ essential: true, style: "medium" });
                      }}
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
          <View style={{ paddingTop: uiStore.dimensions.height * 0.25 }}>
            <Text style={{ textAlign: "center", fontSize: 24 }}>
              A verification email has been sent! Check your email (and spam
              folder) to complete registration.
            </Text>
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

export default SignUpScreen;
