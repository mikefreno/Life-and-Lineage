import { Platform, Pressable, TextInput, View } from "react-native";
import { Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import D20Die from "../../components/DieRollAnim";
import { useAuth } from "../../auth/AuthContext";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { API_BASE_URL } from "../../config/config";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleIcon } from "../../assets/icons/SVGIcons";

const SignInScreen = observer(() => {
  const auth = useAuth();

  const { colorScheme } = useColorScheme();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

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
            await fetch(
              "https://www.freno.me/api/magic-delve/resend-verification",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: emailAddress }),
              },
            );
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
          // window should close automatically
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

  return (
    <View className="mt-[5vh]">
      <View className="flex items-center">
        <Pressable
          onPress={auth.googleSignIn}
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
            onPress={auth.appleSignIn}
          />
        )}
      </View>
      <Text className="text-center text-3xl pt-4">Email Login</Text>
      {awaitingResponse ? (
        <View className="pt-[25vh]">
          <D20Die />
        </View>
      ) : (
        <>
          <TextInput
            className="mx-16 my-6 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
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
            className="mx-16 my-6 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
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

          {error && (
            <Text className="text-center px-6" style={{ color: "#ef4444" }}>
              {error}
            </Text>
          )}
          <GenericRaisedButton
            disabledCondition={password.length == 0 || emailAddress.length == 0}
            onPressFunction={attemptLogin}
            backgroundColor={"#2563eb"}
            textColor={"#fafafa"}
          >
            Sign In
          </GenericRaisedButton>
        </>
      )}
    </View>
  );
});
export default SignInScreen;
