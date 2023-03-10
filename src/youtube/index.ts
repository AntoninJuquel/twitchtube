import { upload as uploadYoutube } from "youtube-videos-uploader";
import { Video, Credentials } from "youtube-videos-uploader/dist/types";
import * as path from "path";
import { gameListSorted, broadcasterListSorted } from "../twitch";
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
  const streamers = broadcasterListSorted(clips);
  const games = gameListSorted(clips);

  const replacedCount: Record<string, number> = {
    "{count}": 0,
    "{streamer}": 0,
    "{game}": 0,
  };
  const replacer: Record<string, () => string> = {
    "{count}": () => clips.length.toString(),
    "{streamer}": () => streamers[replacedCount["{streamer}"]++]?.name ?? "",
    "{game}": () => games[replacedCount["{game}"]++]?.name ?? "",
  };

  return title.replace(
    /{[a-zA-Z]+}/g,
    (matched) => replacer[matched]?.() ?? matched
  );
}

function generateTags(clips: Clip[]) {
  const streamers = broadcasterListSorted(clips);
  const games = gameListSorted(clips);

  const tags = [
    ...streamers.map((streamer) => streamer.name),
    ...games.map((game) => game.name),
  ];

  return tags;
}

export async function upload(clips: Clip[]) {
  const video: Video = {
    title: generateTitle(config.TITLE, clips),
    description: generateDescription(clips),
    path: path.join(config.OUTPUT_DIR, `out.mp4`),
    tags: generateTags(clips),
  };
  const credentials: Credentials = {
    email: process.env.YOUTUBE_EMAIL || "",
    pass: process.env.YOUTUBE_PASSWORD || "",
    recoveryemail: process.env.YOUTUBE_RECOVERY_EMAIL || "",
  };

  uploadYoutube(credentials, [video]).then(console.log).catch(console.error);
}
