import fs from "fs";
import { upload } from "youtube-videos-uploader";
import {
  Video,
  Credentials,
  MessageTransport,
} from "youtube-videos-uploader/dist/types";
import path from "path";
import { Config, Metadata } from "../types";
import { PuppeteerLaunchOptions } from "puppeteer";

import { Logger } from "winston";

let config: Config;
let logger: Logger;

export async function init(c: Config, l: Logger) {
  config = c;
  logger = l;
}

function generateDescription(metadata: Metadata) {
  const { broadcasters } = metadata;

  const header = config.DESCRIPTION.HEADER;
  const footer = config.DESCRIPTION.FOOTER;

  return `${header}\n${broadcasters.join("\n")}\n${footer}`;
}

function generateTitle(title: string, metadata: Metadata) {
  const { broadcasters, games, clipCount } = metadata;

  const replacedCount: Record<string, number> = {
    "{count}": 0,
    "{streamer}": 0,
    "{game}": 0,
  };
  const replacer: Record<string, () => string> = {
    "{count}": () => clipCount.toString(),
    "{streamer}": () => broadcasters[replacedCount["{streamer}"]++] ?? "",
    "{game}": () => games[replacedCount["{game}"]++] ?? "",
  };

  return title.replace(
    /{[a-zA-Z]+}/g,
    (matched) => replacer[matched]?.() ?? matched
  );
}

function generateTags(metadata: Metadata) {
  const { broadcasters, games } = metadata;
  const tags = [...broadcasters, ...games];
  return tags;
}

export async function uploadVideo() {
  const metadata = JSON.parse(
    fs.readFileSync(path.join(config.METADATA_DIR, "metadata.json"), "utf8")
  ) as Metadata;

  logger.info("Video metadata:", metadata);

  const videoPath = path.join(config.OUTPUT_DIR, `out.mp4`);

  logger.info(`Video path: ${videoPath}`);

  const video: Video = {
    title: generateTitle(config.TITLE, metadata),
    description: generateDescription(metadata),
    path: videoPath,
    tags: generateTags(metadata),
    channelName: config.CHANNEL_NAME,
    playlist: config.PLAYLIST,
    isAgeRestriction: false,
    isNotForKid: true,
    skipProcessingWait: true,
  };

  const credentials: Credentials = {
    email: process.env.YOUTUBE_EMAIL || "",
    pass: process.env.YOUTUBE_PASSWORD || "",
    recoveryemail: process.env.YOUTUBE_RECOVERY_EMAIL || "",
  };

  const puppeteerLaunchOptions: PuppeteerLaunchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  const messageTransport: MessageTransport = {
    log: (message) => logger.info(message),
    userAction: (message) => logger.info(message),
  };

  logger.info("Uploading video to YouTube");

  await upload(credentials, [video], puppeteerLaunchOptions, messageTransport)
    .then((url) => logger.info(`Video uploaded to ${url}`))
    .catch((reason) => logger.error(`Error uploading video: ${reason}`));

  if (config.REMOVE_VIDEO) {
    logger.info("Removing video");
    fs.unlinkSync(videoPath);
  }
}
