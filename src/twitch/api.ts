import storage from "node-persist";
import axios, { AxiosInstance } from "axios";

import {
  GenericTwitchResponse,
  TwitchClipParams,
  TwitchGame,
  TwitchUser,
  TwitchClip,
} from "./types";

class Twitch {
  private twitch: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private authDir: string;

  constructor(
    clientId: string,
    clientSecret: string,
    authDir: string = "twitch-auth"
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authDir = authDir;
    this.twitch = axios.create({
      baseURL: "https://api.twitch.tv/helix",
      headers: {
        "Client-ID": this.clientId,
      },
    });
    this.twitch.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status === 401) {
          await this.refreshToken();
          return this.twitch.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async init() {
    await storage.init({
      dir: this.authDir,
    });
    const token = await storage.getItem("twitchToken");
    if (token) {
      this.twitch.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      await this.refreshToken();
    }
    return this;
  }

  private async refreshToken() {
    console.log("Refreshing token");
    const response = await axios.post("https://id.twitch.tv/oauth2/token", {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
    });
    const { access_token } = response.data;
    this.twitch.defaults.headers.Authorization = `Bearer ${access_token}`;
    await storage.setItem("twitchToken", access_token);
  }

  /**
   * Generic GET request to the Twitch API
   * @doc https://dev.twitch.tv/docs/api/reference/
   * @param endpoint Endpoint to request
   * @param params Query parameters
   * @returns GenericTwitchResponse<T>
   */
  public async get<T>(
    endpoint: string,
    params: Record<string, string>
  ): Promise<GenericTwitchResponse<T>> {
    const response = await this.twitch.get<GenericTwitchResponse<T>>(endpoint, {
      params,
    });
    const { data } = response;
    return data;
  }

  public async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await this.get<T>(endpoint, { id });
    return response.data[0];
  }

  public async getGameByName(name: string): Promise<TwitchGame> {
    const response = await this.get<TwitchGame>("games", {
      name,
    });
    return response.data[0];
  }

  public async getUserByName(name: string): Promise<TwitchUser> {
    const response = await this.get<TwitchUser>("users", {
      login: name,
    });
    return response.data[0];
  }

  public async getClips(
    params: TwitchClipParams
  ): Promise<GenericTwitchResponse<TwitchClip>> {
    const response = await this.get<TwitchClip>("clips", params);
    return response;
  }
}

export default Twitch;
