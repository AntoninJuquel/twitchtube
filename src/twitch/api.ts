import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as path from "path";
import { Category, CategoryId, Clip, Game, Params, TwitchClip } from "./types";
import { convertThumbnailUrlToVideoUrl, getBroadcasterUrl } from "./utils";

import config from "../config";

export async function initTwitch(): Promise<AxiosInstance> {
  const response = await axios.post("https://id.twitch.tv/oauth2/token", {
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });
  const { access_token } = response.data;
  const twitch = axios.create({
    baseURL: "https://api.twitch.tv/helix",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${access_token}`,
    },
  });
  twitch.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        return initTwitch();
      }
      return Promise.reject(error);
    }
  );

  return twitch;
}

export async function getItemByName<T>(
  twitch: AxiosInstance,
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

export async function getItemById<T>(
  twitch: AxiosInstance,
  id: string,
  category: Category
) {
  const response = await twitch.get<AxiosResponse<T[]>>(`/${category}`, {
    params: {
      id,
    },
  });
  const { data } = response.data;
  return data[0];
}

export async function getClips(
  twitch: AxiosInstance,
  params: Params,
  category: CategoryId,
  id: string
): Promise<Clip[]> {
  const response = await twitch.get<AxiosResponse<TwitchClip[]>>("/clips", {
    params: {
      ...params,
      [category]: id,
    },
  });
  const { data } = response.data;
  return await Promise.all(
    data.map(async (clip) => ({
      id: clip.id,
      path: path.join(config.CLIPS_DIR, `${clip.id}.mp4`),
      title: clip.title,
      view_count: clip.view_count,
      duration: clip.duration,
      video_url: convertThumbnailUrlToVideoUrl(clip.thumbnail_url),
      broadcaster_id: clip.broadcaster_id,
      broadcaster_name: clip.broadcaster_name,
      broadcaster_url: getBroadcasterUrl(clip.broadcaster_name),
      game_id: clip.game_id,
      game_name: (
        await getItemById<Game>(twitch, clip.game_id, Category.Games)
      ).name,
    }))
  );
}
