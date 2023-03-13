import { upload as uploadYoutube } from "youtube-videos-uploader";
import { Video, Credentials } from "youtube-videos-uploader/dist/types";
import { PuppeteerNodeLaunchOptions } from "puppeteer";
import * as path from "path";
import { clipsGroupedBy } from "../twitch/utils";
import { Clip } from "../types";

import config from "../config";

function generateDescription(clips: Clip[]) {
  const header = "Top Clips of the Week";
  const footer = "Thanks for watching!";

  const streamers = [
    ...new Set(
      clips.map((clip) => `${clip.broadcaster_name} : ${clip.broadcaster_url}`)
    ).values(),
  ].join("\n");

  return `${header}

${streamers}

${footer}`;
}

function generateTitle(title: string, clips: Clip[]) {
  const streamers = [...clipsGroupedBy(clips, "broadcaster_name").entries()];
  const games = [...clipsGroupedBy(clips, "game_name").entries()];

  const replacedCount: Record<string, number> = {
    "{count}": 0,
    "{streamer}": 0,
    "{game}": 0,
  };
  const replacer: Record<string, () => string> = {
    "{count}": () => clips.length.toString(),
    "{streamer}": () =>
      streamers[replacedCount["{streamer}"]++]?.[0].toString() ?? "",
    "{game}": () => games[replacedCount["{game}"]++]?.[0].toString() ?? "",
  };

  return title.replace(
    /{[a-zA-Z]+}/g,
    (matched) => replacer[matched]?.() ?? matched
  );
}

function generateTags(clips: Clip[]) {
  const streamers = clipsGroupedBy(clips, "broadcaster_name");
  const games = clipsGroupedBy(clips, "game_name");
  const tags = [...streamers.keys(), ...games.keys()];

  return tags;
}

export async function upload(clips: Clip[]) {
  const video: Video = {
    title: generateTitle(config.TITLE, clips),
    description: generateDescription(clips),
    path: path.join(config.OUTPUT_DIR, `out.mp4`),
    tags: generateTags(clips),
  };
  console.log(video);
  const credentials: Credentials = {
    email: process.env.YOUTUBE_EMAIL || "",
    pass: process.env.YOUTUBE_PASSWORD || "",
    recoveryemail: process.env.YOUTUBE_RECOVERY_EMAIL || "",
  };
  const puppeteerOptions: PuppeteerNodeLaunchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  uploadYoutube(credentials, [video], puppeteerOptions)
    .then(console.log)
    .catch(console.error);
}
