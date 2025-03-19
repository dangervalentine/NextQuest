import {
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_GRANT_TYPE,
} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TwitchAuthResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

class TwitchAuthService {
    private static API_URL = "https://id.twitch.tv/oauth2/token";
    private static ACCESS_TOKEN_KEY = "TWITCH_ACCESS_TOKEN";

    public static async fetchToken(): Promise<string | null> {
        const bodyData = new URLSearchParams({
            client_id: TWITCH_CLIENT_ID,
            client_secret: TWITCH_CLIENT_SECRET,
            grant_type: TWITCH_GRANT_TYPE,
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
            console.log("Twitch Token Response:", data);

            await AsyncStorage.setItem(
                this.ACCESS_TOKEN_KEY,
                data.access_token
            );
            return data.access_token;
        } catch (error) {
            console.error("Error fetching Twitch token:", error);
            return null;
        }
    }

    public static async getToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);

            if (token) {
                return token;
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
        } catch (error) {
            console.error("Error clearing Twitch token:", error);
        }
    }
}

export default TwitchAuthService;
