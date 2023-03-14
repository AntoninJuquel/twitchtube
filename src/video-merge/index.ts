import concat from "ffmpeg-concat";
import fs from "fs";
import path from "path";
import os from "os";
import { Logger } from "winston";
import { ConcatOptions, Config } from "../types";

let config: Config;
let logger: Logger;

export async function init(c: Config, l: Logger) {
  config = c;
  logger = l;
}

export async function mergeClips() {
  logger.info("Merging clips");
  const output = path.join(config.OUTPUT_DIR, `out.mp4`);
  const clips = fs.readdirSync(config.CLIPS_DIR);
  const videos = clips.map((clip) => path.join(config.CLIPS_DIR, clip));
  const concatOptions: ConcatOptions = {
    output,
    videos,
    transition: {
      name: config.TRANSITION.NAME,
      duration: config.TRANSITION.DURATION,
    },
    tempDir: config.TEMP_DIR,
    log: (message) => logger.info(message),
    cleanupFrames: true,
    concurrency: os.cpus().length,
  };
  await concat(concatOptions);

  logger.info("Removing frames");
  const frames = fs.readdirSync(config.TEMP_DIR);
  for (const frame of frames) {
    fs.unlinkSync(path.join(config.TEMP_DIR, frame));
  }

  if (config.REMOVE_CLIPS) {
    logger.info("Removing clips");
    const clips = fs.readdirSync(config.CLIPS_DIR);
    for (const clip of clips) {
      fs.unlinkSync(path.join(config.CLIPS_DIR, clip));
    }
  }
}
