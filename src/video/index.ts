import concat from "ffmpeg-concat";
import * as fs from "fs";
import * as path from "path";

import config from "../config";

export async function merge() {
  const output = path.join(config.OUTPUT_DIR, `out.mp4`);

  const clips = fs.readdirSync(config.CLIPS_DIR);
  const videos = clips.map((clip) => path.join(config.CLIPS_DIR, clip));

  await concat({
    output,
    videos,
    transition: {
      name: config.TRANSITION.NAME,
      duration: config.TRANSITION.DURATION,
    },
    tempDir: config.TEMP_DIR,
  });

  return output;
}
