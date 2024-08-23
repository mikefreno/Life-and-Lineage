import { TextInput, View } from "react-native";
import { Text } from "../../components/Themed";
import { useState } from "react";
import { useColorScheme } from "nativewind";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { router } from "expo-router";
import D20Die from "../../components/DieRollAnim";
import { useAuth } from "../../auth/AuthContext";

export default function Page() {
  const auth = useAuth();

  const { colorScheme } = useColorScheme();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const attemptLogin = async () => {
    setAwaitingResponse(true);
    const data = { email: emailAddress, password: password };
    try {
      const res = await fetch(
        "https://www.freno.me/api/magic-delve/email-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

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
          // Store the token
          await auth.login(result.token, result.email);
          // close out this window
          router.back();
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
    <View>
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
}
