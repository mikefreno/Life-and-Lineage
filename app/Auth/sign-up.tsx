import { TextInput, View } from "react-native";
import { Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import D20Die from "../../components/DieRollAnim";
import { isValidPassword } from "../../auth/password";

export default function SignUpScreen() {
  const { colorScheme } = useColorScheme();

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

  useEffect(() => {
    if (password.length !== trackedLength + 1) {
      setIsAutofilled(true);
    } else {
      setTrackedLength(password.length);
    }
  }, [password]);

  const attemptRegistration = async () => {
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
      const res = await fetch(
        "https://www.freno.me/api/magic-delve/email-registration",
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

  return (
    <View>
      {!emailSent ? (
        <>
          <Text className="text-center text-3xl pt-4">Email Registration</Text>
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
                className={`mx-16 my-6 rounded border border-zinc-800 pl-2 text-xl  dark:border-zinc-100  ${
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
              <TextInput
                className={`mx-16 my-6 rounded border border-zinc-800 pl-2 text-xl  dark:border-zinc-100  ${
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
                  Password must contain a lower-case, upper-case, and special
                  character()
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
                onPressFunction={attemptRegistration}
                backgroundColor={"#2563eb"}
              >
                Sign Up
              </GenericRaisedButton>
            </>
          )}
        </>
      ) : (
        <View className="pt-[25vh]">
          <Text className="text-center text-2xl">
            A verification email has been sent! Check your email (and spam
            folder) to complete registration.
          </Text>
        </View>
      )}
    </View>
  );
}
