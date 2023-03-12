import { AxiosInstance } from "axios";
import { Category, Params, CategoryIdMap, Game, Broadcaster } from "./types";
import { getItemByName } from "./api";

import config from "../config";

export async function convertNamesToIds(
  twitch: AxiosInstance,
  names: string[],
  category: Exclude<Category, Category.Clips>
): Promise<string[]> {
  return await Promise.all(
    names.map(
      async (game: string) =>
        (
          await getItemByName<Game | Broadcaster>(twitch, game, category)
        ).id
    )
  );
}

export async function getIds(twitch: AxiosInstance): Promise<CategoryIdMap> {
  const ids: CategoryIdMap = {
    game_id: await convertNamesToIds(
      twitch,
      config.SEARCH.games,
      Category.Games
    ),
    broadcaster_id: await convertNamesToIds(
      twitch,
      config.SEARCH.users,
      Category.Users
    ),
  };
  return ids;
}

export function convertThumbnailUrlToVideoUrl(thumbnailUrl: string) {
  const slicePoint = thumbnailUrl.indexOf("-preview-");
  const mp4Url = thumbnailUrl.slice(0, slicePoint) + ".mp4";
  return mp4Url;
}

export function getBroadcasterUrl(broadcasterName: string) {
  return `https://www.twitch.tv/${broadcasterName}`;
}

export function initParams(): Params {
  const params: Params = {
    first: config.LIMIT,
  };

  if (config.PERIOD) {
    params["started_at"] = new Date(
      new Date().getTime() - config.PERIOD * 60 * 60 * 1000
    ).toISOString();
    params["ended_at"] = new Date().toISOString();
  }

  return params;
}
