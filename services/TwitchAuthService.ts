import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TwitchAuthResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

class TwitchAuthService {
    private static API_URL = "https://id.twitch.tv/oauth2/token";
    private static ACCESS_TOKEN_KEY = "TWITCH_ACCESS_TOKEN";
    private static EXPIRATION_TIME_KEY = "TWITCH_ACCESS_TOKEN_EXPIRATION";

    public static async fetchToken(): Promise<string | null> {
        const bodyData = new URLSearchParams({
            client_id: TWITCH_CLIENT_ID,
            client_secret: TWITCH_CLIENT_SECRET,
            grant_type: "client_credentials",
        }).toString();

        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: bodyData,
            });

            if (!response.ok) {
                throw new Error(
                    `Error: ${response.status} ${response.statusText}`
                );
            }

            const data: TwitchAuthResponse = await response.json();

            const expirationTime = Date.now() + data.expires_in * 1000;

            await AsyncStorage.setItem(
                this.ACCESS_TOKEN_KEY,
                data.access_token
            );
            await AsyncStorage.setItem(
                this.EXPIRATION_TIME_KEY,
                expirationTime.toString()
            );

            return data.access_token;
        } catch (error) {
            console.error("Error fetching Twitch token:", error);
            return null;
        }
    }

    public static async getValidToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
            const expirationTimeStr = await AsyncStorage.getItem(
                this.EXPIRATION_TIME_KEY
            );

            if (token && expirationTimeStr) {
                const expirationTime = parseInt(expirationTimeStr, 10);

                if (Date.now() < expirationTime) {
                    return token;
                }
            }

            const newToken = await this.fetchToken();
            return newToken;
        } catch (error) {
            console.error("Error retrieving or fetching Twitch token:", error);
            return null;
        }
    }

    public static async clearStoredToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.ACCESS_TOKEN_KEY);
            await AsyncStorage.removeItem(this.EXPIRATION_TIME_KEY);
        } catch (error) {
            console.error("Error clearing Twitch token:", error);
        }
    }
}

export default TwitchAuthService;
