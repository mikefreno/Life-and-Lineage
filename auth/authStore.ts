import { makeAutoObservable } from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

class AuthStore {
  token: string | null = null;
  email: string | null = null;
  provider: "email" | "apple" | "google" | null = null;
  db_url: string | null = null;
  db_token: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setEmail(email: string | null) {
    this.email = email;
  }
  setDBUrl(url: string | null) {
    this.db_url = url;
  }

  setDBToken(token: string | null) {
    this.db_token = token;
  }
  setProvider(token: string | null) {
    this.db_token = token;
  }

  async initializeAuth() {
    const storedToken = await AsyncStorage.getItem("userToken");
    if (storedToken) {
      const validationResult = await this.validateToken(storedToken);
      if (validationResult) {
        const currentToken = await AsyncStorage.getItem("userToken");
        this.setToken(currentToken);
        const storedEmail = await AsyncStorage.getItem("userEmail");
        this.setEmail(storedEmail);
      } else {
        await this.logout();
      }
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        return false;
      }

      const response = await fetch(
        "https://www.freno.me/api/magic-delve/verify-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          await AsyncStorage.setItem("userToken", data.token);
          return true;
        }
        return true; // this should not be hit
      }
      return false;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  get isAuthenticated() {
    return !!this.token;
  }

  async login(token: string, email: string, provider: string) {
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userEmail", email);
    this.setToken(token);
    this.setEmail(email);
    this.setProvider(provider);
  }

  async logout() {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userEmail");
    this.setToken(null);
    this.setEmail(null);
  }

  async refreshDatabaseCreds() {
    const response = await fetch(
      "https://www.freno.me/api/magic-delve/verify-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    const parsed = await response.json();
    if (response.ok) {
      this.setDBUrl(parsed.db_url);
      this.setDBToken(parsed.db_token);
    }
    if (parsed.message === "destroy token") {
      this.logout();
    }
  }

  async _debugLog() {
    try {
      const [storedToken, storedEmail] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userEmail"),
      ]);

      const debugInfo = [
        { key: "Stored Token", value: storedToken },
        { key: "Stored Email", value: storedEmail },
        { key: "State Token", value: this.token },
        { key: "State Email", value: this.email },
        { key: "State Provider", value: this.provider },
        { key: "State db_url", value: this.db_url },
        { key: "State db_token", value: this.db_token },
      ];

      console.log("*******USER AUTH STATE*******");
      debugInfo.forEach((item) => console.log(`${item.key}: ${item.value}`));
    } catch (error) {
      console.error("Error in _debugLog:", error);
    }
  }
}

export const authStore = new AuthStore();
