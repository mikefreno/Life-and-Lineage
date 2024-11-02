import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "../../components/Themed";
import { useState } from "react";
import { useColorScheme } from "nativewind";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { useAuth } from "../../auth/AuthContext";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { API_BASE_URL } from "../../config/config";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleIcon } from "../../assets/icons/SVGIcons";
import D20DieAnimation from "../../components/DieRollAnim";
import { View as ThemedView } from "../../components/Themed";
import { useHeaderHeight } from "@react-navigation/elements";
import { wait } from "../../utility/functions/misc";
import * as Updates from "expo-updates";

const SignInScreen = observer(() => {
  const auth = useAuth();

  const { colorScheme } = useColorScheme();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const header = useHeaderHeight();

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
          await auth.login({
            token: result.token,
            email: result.email,
            provider: "email",
          });
          wait(500).then(() => {
            while (router.canGoBack()) {
              router.back();
            }
            router.push("/Options");
          });
        } else {
          setError("Login failed for an unknown reason.");
        }
      }
    } catch (e) {
      console.error("Network Error:", e);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setAwaitingResponse(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAwaitingResponse(true);
    try {
      const res = await auth.googleSignIn();
      if (res == 200) {
        while (router.canGoBack()) {
          router.back();
        }
        router.push("/Options");
      } else {
        wait(250).then(() => {
          Updates.reloadAsync();
        });
      }
    } catch (e) {
      setError("Failed to sign in with Google. Please try again.");
    }
    setAwaitingResponse(false);
  };

  const handleAppleSignIn = async () => {
    setAwaitingResponse(true);
    try {
      const res = await auth.appleSignIn();
      if (res == 200) {
        while (router.canGoBack()) {
          router.back();
        }
        router.push("/Options");
      } else {
        wait(250).then(() => {
          Updates.reloadAsync();
        });
      }
    } catch (e) {
      console.error(e);
      setError("Failed to sign in with Apple. Please try again.");
    }
    setAwaitingResponse(false);
  };

  return awaitingResponse ? (
    <ThemedView className="pt-[25vh] flex-1">
      <D20DieAnimation keepRolling={true} />
    </ThemedView>
  ) : (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={header}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ThemedView className="flex-1 justify-center items-center">
            <Pressable
              onPress={handleGoogleSignIn}
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
              <Text className="text-xl">Sign in with Google</Text>
              <GoogleIcon height={20} width={20} />
            </Pressable>
            {Platform.OS == "ios" && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  colorScheme == "dark"
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={5}
                style={{ width: 230, height: 48 }}
                onPress={handleAppleSignIn}
              />
            )}

            <View className="w-3/4 pt-6 pb-16">
              {error && (
                <Text className="text-center px-6" style={{ color: "#ef4444" }}>
                  {error}
                </Text>
              )}
              <Text className="text-center text-3xl pt-4">Email Login</Text>
              <TextInput
                className="my-6 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
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
              <TextInput
                className="mt-6 mb-2 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
                placeholderTextColor={
                  colorScheme == "light" ? "#d4d4d8" : "#71717a"
                }
                onChangeText={(text) => setPassword(text)}
                placeholder={"Enter Password..."}
                autoComplete={"current-password"}
                autoCorrect={false}
                autoCapitalize={"none"}
                secureTextEntry
                value={password}
                style={{
                  fontFamily: "PixelifySans",
                  paddingVertical: 8,
                  minWidth: "50%",
                  fontSize: 20,
                }}
              />
              <GenericRaisedButton
                disabledCondition={
                  password.length == 0 || emailAddress.length == 0
                }
                onPressFunction={attemptLogin}
                backgroundColor={"#2563eb"}
                textColor={"#fafafa"}
                style={{ height: 48 }}
              >
                Sign In
              </GenericRaisedButton>
            </View>
          </ThemedView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
});
export default SignInScreen;
