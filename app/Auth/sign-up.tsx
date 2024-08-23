import { Platform, Pressable, TextInput, View } from "react-native";
import { Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import D20Die from "../../components/DieRollAnim";
import { isValidPassword } from "../../auth/password";
import { useVibration } from "../../utility/customHooks";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { configureGoogleSignIn } from "../../components/GoogleComponents";
import { useAuth } from "../../auth/AuthContext";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";

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

  if (auth.isAuthenticated) {
    while (router.canGoBack()) {
      router.back();
    }
    router.push("/Options");
  }

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

  useEffect(() => {
    configureGoogleSignIn();
    //getCurrentUser();
  }, []);

  const googleSignUp = async () => {
    setAwaitingResponse(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      //console.log(userInfo);
      const { idToken } = userInfo;

      const response = await fetch(
        "https://www.freno.me/api/magic-delve/callback/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.success) {
        await auth.login(data.token, data.user.email, "google");
        setAwaitingResponse(false);
      } else {
        setError("Server authentication failed");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // sign in was cancelled by user
            setTimeout(() => {
              setError("cancelled");
            }, 500);
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            setError(
              "in progress\n operation (eg. sign in) already in progress",
            );
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // android only
            setError("play services not available or outdated");
            break;
          default:
            setError("Something went wrong: \n" + error.toString());
        }
      } else {
        setError(
          `an unknown error that's not related to google sign in occurred`,
        );
      }
    }
  };

  return !usingEmail ? (
    <View>
      <GoogleSigninButton onPress={googleSignUp} />
      {Platform.OS == "ios" && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{ height: 200, width: 44 }}
          onPress={async () => {
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              console.log(credential);
              // signed in
            } catch (e) {
              if (e.code === "ERR_REQUEST_CANCELED") {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
        />
      )}
      <GenericRaisedButton onPressFunction={() => setUsingEmail(true)}>
        Email
      </GenericRaisedButton>
    </View>
  ) : !emailSent ? (
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
        </>
      )}
    </>
  ) : (
    <View className="pt-[25vh]">
      <Text className="text-center text-2xl">
        A verification email has been sent! Check your email (and spam folder)
        to complete registration.
      </Text>
    </View>
  );
});
export default SignUpScreen;
