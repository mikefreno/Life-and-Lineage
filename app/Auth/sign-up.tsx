import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { isValidPassword } from "../../auth/password";
import { useVibration } from "../../utility/customHooks";
import { GoogleIcon } from "../../assets/icons/SVGIcons";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../../auth/AuthContext";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { API_BASE_URL } from "../../config/config";
import D20DieAnimation from "../../components/DieRollAnim";
import { ThemedView, Text } from "../../components/Themed";
import { useHeaderHeight } from "@react-navigation/elements";

const SignUpScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();
  const auth = useAuth();

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

  useEffect(() => {
    if (auth.isAuthenticated) {
      const navigateToOptions = async () => {
        while (router.canGoBack()) {
          router.back();
        }
        router.push("/Options");
      };

      navigateToOptions();
    }
  }, [auth.isAuthenticated, router]);

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
      await auth.googleSignIn();
      setAwaitingResponse(false);
    } catch (error) {
      setError("Failed to sign up with Google. Please try again.");
      setAwaitingResponse(false);
    }
  };

  const handleAppleSignUp = async () => {
    setAwaitingResponse(true);
    try {
      await auth.appleSignIn();
      setAwaitingResponse(false);
    } catch (error) {
      setError("Failed to sign up with Apple. Please try again.");
    }
    setAwaitingResponse(false);
  };

  return (
    <ThemedView className="flex-1">
      {awaitingResponse ? (
        <View className="pt-[25vh]">
          <D20DieAnimation keepRolling={awaitingResponse} />
        </View>
      ) : !usingEmail ? (
        <>
          {error && (
            <Text className="text-center" style={{ color: "#ef4444" }}>
              {error}
            </Text>
          )}
          <View className="flex items-center mt-[20vh] px-4">
            <Pressable
              onPress={handleGoogleSignUp}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: colorScheme == "dark" ? "#fafafa" : "#27272a",
                backgroundColor: colorScheme == "dark" ? "#27272a" : "#ffffff",
                paddingHorizontal: 12,
                marginTop: -8,
                marginBottom: 8,
                paddingVertical: 8,
                borderRadius: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
                elevation: 2,
                width: 230,
              }}
            >
              <Text className="text-xl">Register with Google</Text>
              <GoogleIcon height={20} width={20} />
            </Pressable>
            {Platform.OS == "ios" && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                }
                buttonStyle={
                  colorScheme == "dark"
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={5}
                style={{ width: 230, height: 48 }}
                onPress={handleAppleSignUp}
              />
            )}
            <GenericRaisedButton
              onPressFunction={() => setUsingEmail(true)}
              backgroundColor={"#2563eb"}
              style={{ width: 230 }}
            >
              <Text className="text-xl text-center" style={{ color: "white" }}>
                Email
              </Text>
            </GenericRaisedButton>
          </View>
        </>
      ) : !emailSent ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={header + (Platform.OS == "ios" ? 20 : 0)}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-evenly">
              <Text className="text-center text-3xl pt-4">
                Email Registration
              </Text>
              <TextInput
                className="mx-16 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
                placeholderTextColor={
                  colorScheme == "light" ? "#d4d4d8" : "#71717a"
                }
                autoComplete={"email"}
                inputMode={"email"}
                onChangeText={(text) => setEmailAddress(text)}
                placeholder={"Enter Email Address..."}
                autoCorrect={false}
                autoCapitalize={"none"}
                value={emailAddress}
                style={{
                  fontFamily: "PixelifySans",
                  paddingVertical: 8,
                  minWidth: "50%",
                  fontSize: 20,
                }}
              />
              <View>
                <TextInput
                  className={`mx-16 rounded border border-zinc-800 pl-2 text-xl  dark:border-zinc-100  ${
                    isAutofilled ? "text-black" : "text-black dark:text-zinc-50"
                  }`}
                  placeholderTextColor={
                    colorScheme == "light" ? "#d4d4d8" : "#71717a"
                  }
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
                  style={{
                    fontFamily: "PixelifySans",
                    paddingVertical: 8,
                    minWidth: "50%",
                    fontSize: 20,
                  }}
                />
                <Text className="text-center">
                  Password must contain at least 8 characters, a lower-case,
                  upper-case, and either a number or special character(!@$%
                  etc.)
                </Text>
              </View>
              <TextInput
                className={`mx-16 rounded border border-zinc-800 pl-2 text-xl  dark:border-zinc-100  ${
                  isAutofilled ? "text-black" : "text-black dark:text-zinc-50"
                }`}
                placeholderTextColor={
                  colorScheme == "light" ? "#d4d4d8" : "#71717a"
                }
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
                style={{
                  fontFamily: "PixelifySans",
                  paddingVertical: 8,
                  minWidth: "50%",
                  fontSize: 20,
                }}
              />
              {shortPassword && (
                <Text className="text-center" style={{ color: "#ef4444" }}>
                  Password too short, must be at least 8 chars
                </Text>
              )}
              {simplePassword && (
                <Text className="text-center" style={{ color: "#ef4444" }}>
                  Password must contain a lower-case, upper-case, and either a
                  number or special character(!@$% etc.)
                </Text>
              )}
              {passwordMismatch && (
                <Text className="text-center" style={{ color: "#ef4444" }}>
                  Passwords must match!
                </Text>
              )}
              {error && (
                <Text className="text-center" style={{ color: "#ef4444" }}>
                  {error}
                </Text>
              )}
              <GenericRaisedButton
                disabledCondition={
                  password.length == 0 ||
                  passwordConf.length == 0 ||
                  emailAddress.length == 0
                }
                onPressFunction={handleEmailSignUp}
                backgroundColor={"#2563eb"}
                textColor={"#fafafa"}
              >
                Sign Up
              </GenericRaisedButton>
              <Pressable
                onPress={() => {
                  setUsingEmail(false);
                  vibration({ essential: true, style: "medium" });
                }}
                className="m-8"
              >
                <Text className="underline" style={{ color: "#3b82f6" }}>
                  Use a provider instead
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      ) : (
        <View className="pt-[25vh]">
          <Text className="text-center text-2xl">
            A verification email has been sent! Check your email (and spam
            folder) to complete registration.
          </Text>
        </View>
      )}
    </ThemedView>
  );
});

export default SignUpScreen;
