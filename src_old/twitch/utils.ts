import { AxiosInstance } from "axios";
import * as path from "path";

import { Category, Params, TwitchClip, Clip, Game, Broadcaster } from "./types";
import { getItemById, getItemByName } from "./api";

import { Config } from "../types";

export function clipsGroupedBy(
  clips: Clip[],
  groupBy: keyof Clip
): Map<string, Clip[]> {
  const groups = clips.reduce((current: Map<string, Clip[]>, clip) => {
    const key = clip[groupBy].toString();
    const group = current.get(key);
    if (group) {
      current.set(key, [...group, clip]);
    } else {
      current.set(key, [clip]);
    }

    return current;
  }, new Map<string, Clip[]>());

  return new Map(
    [...groups.entries()].sort((a, b) => {
      const aViewCount = a[1].reduce(
        (current, clip) => current + clip.view_count,
        0
      );
      const bViewCount = b[1].reduce(
        (current, clip) => current + clip.view_count,
        0
      );

      return bViewCount - aViewCount;
    })
  );
}

export function convertThumbnailUrlToVideoUrl(thumbnailUrl: string) {
  const slicePoint = thumbnailUrl.indexOf("-preview-");
  const mp4Url = thumbnailUrl.slice(0, slicePoint) + ".mp4";
  return mp4Url;
}

export function getBroadcasterUrl(broadcasterName: string) {
  return `https://www.twitch.tv/${broadcasterName}`;
}

export default function (config: Config) {
  async function convertNamesToIds(
    names: string[],
    category: Exclude<Category, Category.Clips>
  ): Promise<string[]> {
    return await Promise.all(
      names.map(
        async (game: string) =>
          (
            await getItemByName<Game | Broadcaster>(game, category)
          ).id
      )
    );
  }

  function initParams(): Params {
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

  async function formatTwitchClip(clip: TwitchClip): Promise<Clip> {
    return {
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
      game_name: (await getItemById<Game>(clip.game_id, Category.Games)).name,
    };
  }

  return {
    convertNamesToIds,
    initParams,
    formatTwitchClip,
    getBroadcasterUrl,
    convertThumbnailUrlToVideoUrl,
    clipsGroupedBy,
  };
}
