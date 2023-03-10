import * as dotenv from "dotenv";
import { download } from "./twitch";
import { merge } from "./video";
import { upload } from "./youtube";

dotenv.config();

async function main() {
  const clips = await download();
  await merge();
  await upload(clips);
}

// setInterval(main, config.INTERVAL * 1000);

main();
