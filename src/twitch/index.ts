import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import MultiProgress from "multi-progress";
import { Broadcaster, CategoryIdMap, Clip, Game, Params } from "./types";
import { getIds, initParams } from "./utils";
import { getClips as getTopClips, initTwitch } from "./api";

export function broadcasterListSorted(clips: Clip[]): Broadcaster[] {
  const broadcasters = clips.reduce(
    (current: Map<string, Broadcaster>, clip) => {
      const broadcaster = current.get(clip.broadcaster_id);
      if (broadcaster) {
        current.set(clip.broadcaster_id, {
          ...broadcaster,
          clips: [...broadcaster.clips, clip],
        });
      } else {
        current.set(clip.broadcaster_id, {
          id: clip.broadcaster_id,
          name: clip.broadcaster_name,
          url: clip.broadcaster_url,
          clips: [clip],
        });
      }

      return current;
    },
    new Map<string, Broadcaster>()
  );

  return [...broadcasters.values()].sort((a, b) => {
    const aCount = a.clips.reduce(
      (current, clip) => current + clip.view_count,
      0
    );
    const bCount = b.clips.reduce(
      (current, clip) => current + clip.view_count,
      0
    );
    return bCount - aCount;
  });
}

export function gameListSorted(clips: Clip[]): Game[] {
  const games = clips.reduce((current: Map<string, Game>, clip) => {
    const game = current.get(clip.game_id);
    if (game) {
      current.set(clip.game_id, {
        ...game,
        clips: [...game.clips, clip],
      });
    } else {
      current.set(clip.game_id, {
        id: clip.game_id,
        name: clip.game_name,
        clips: [clip],
      });
    }

    return current;
  }, new Map<string, Game>());

  return [...games.values()].sort((a, b) => {
    const aCount = a.clips.reduce(
      (current, clip) => current + clip.view_count,
      0
    );
    const bCount = b.clips.reduce(
      (current, clip) => current + clip.view_count,
      0
    );
    return bCount - aCount;
  });
}

async function getClips(twitch: AxiosInstance) {
  const ids: CategoryIdMap = await getIds(twitch);
  const params: Params = initParams();
  const clips = await Promise.all(
    Object.keys(ids).map(async (key) => {
      const category = key as keyof CategoryIdMap;
      const idList = ids[category].filter((id) => id);
      const clipsById = await Promise.all(
        idList.map(
          async (id) => await getTopClips(twitch, params, category, id)
        )
      );
      return clipsById.flat();
    })
  );

  return clips.flat();
}

async function downloadClip(clip: Clip, multi: MultiProgress): Promise<any> {
  const { data, headers } = await axios.get(clip.video_url, {
    responseType: "stream",
  });

  const contentLength = headers["content-length"];

  const progressBar = multi.newBar(
    `-> downloading ${clip.path} [:bar] :percent :etas`,
    {
      width: 40,
      complete: "=",
      incomplete: " ",
      total: parseInt(contentLength),
    }
  );
  data.on("data", (chunk: any) => progressBar.tick(chunk.length));

  const writer = fs.createWriteStream(clip.path);
  data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function downloadClips(clips: Clip[]) {
  const multiProgressBars = new MultiProgress(process.stderr);
  return Promise.all(
    clips.map((clip) => downloadClip(clip, multiProgressBars))
  );
}

export async function download(): Promise<Clip[]> {
  const twitch = await initTwitch();
  const clips = await getClips(twitch);
  await downloadClips(clips).then(() => console.log("Done"));
  return clips;
}
