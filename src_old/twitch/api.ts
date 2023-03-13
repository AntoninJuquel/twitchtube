import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Category, CategoryId, Params, TwitchClip } from "./types";

const twitch = axios.create({
  baseURL: "https://api.twitch.tv/helix",
  headers: {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
  },
});

twitch.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      await refreshToken();
      return twitch.request(error.config);
    }
    return Promise.reject(error);
  }
);

async function refreshToken() {
  console.log("Refreshing token");
  const response = await axios.post("https://id.twitch.tv/oauth2/token", {
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });
  const { access_token } = response.data;
  twitch.defaults.headers.Authorization = `Bearer ${access_token}`;
}

export async function getItemByName<T>(
  name: string,
  category: Exclude<Category, Category.Clips>
): Promise<T> {
  const response = await twitch.get<AxiosResponse<T[]>>(`/${category}`, {
    params: {
      login: name,
      name,
    },
  });
  const { data } = response.data;
  return data[0];
}

export async function getItemById<T>(id: string, category: Category) {
  const response = await twitch.get<AxiosResponse<T[]>>(`/${category}`, {
    params: {
      id,
    },
  });
  const { data } = response.data;
  return data[0];
}

export async function getClips(
  params: Params,
  category: CategoryId,
  id: string
): Promise<TwitchClip[]> {
  console.log(`Getting clips for ${category} ${id}`);
  const localParams = { ...params, [category]: id };
  console.log(localParams);
  const response = await twitch.get<AxiosResponse<TwitchClip[]>>("/clips", {
    params: localParams,
  });
  const { data } = response.data;
  console.log(`Got ${data.length} clips`);
  return data;
}
