import axios from "axios";
import * as fs from "fs";
import MultiProgress from "multi-progress";
import utils from "./utils";
import { getClips as getTopClips } from "./api";

import { Category, CategoryIdMap, Clip, Params } from "./types";
import { Config } from "../types";

export default async function (config: Config) {
  const { convertNamesToIds, formatTwitchClip, initParams } = utils(config);

  async function getClips(): Promise<Clip[]> {
    const ids: CategoryIdMap = {
      game_id: await convertNamesToIds(config.SEARCH.games, Category.Games),
      broadcaster_id: await convertNamesToIds(
        config.SEARCH.users,
        Category.Users
      ),
    };

    const params: Params = initParams();

    const clips = await Promise.all(
      Object.keys(ids).map(async (key) => {
        const category = key as keyof CategoryIdMap;
        const idList = ids[category].filter((id) => id);
        const clipsById = await Promise.all(
          idList.map(
            async (id) =>
              await getTopClips(params, category, id).then(
                async (clips) =>
                  await Promise.all(
                    clips.map(async (clip) => formatTwitchClip(clip))
                  )
              )
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

  async function downloadClips(): Promise<Clip[]> {
    const clips = await getClips();
    const multiProgressBars = new MultiProgress(process.stderr);
    await Promise.all(
      clips.map(async (clip) => await downloadClip(clip, multiProgressBars))
    );
    console.log("Downloaded all clips");
    return clips;
  }

  return downloadClips;
}
