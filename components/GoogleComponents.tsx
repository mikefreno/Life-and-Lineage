import { GoogleSignin } from "@react-native-google-signin/google-signin";
import config from "../config/google_config";
export const PROFILE_IMAGE_SIZE = 150;

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: config.webClientId,
    iosClientId: config.iosClientId,
    offlineAccess: true,
    profileImageSize: PROFILE_IMAGE_SIZE,
  });
};
