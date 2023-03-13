require("dotenv").config();

import { hoursToMilliseconds } from "date-fns";

import twitchModule from "./twitch";
import { merge } from "./video";
import { upload } from "./youtube";

import config from "./config";

import Twitch from "../src/twitch/api";

async function main() {
  // const clips = await (await twitchModule(config))();
  // await merge();
  // await upload(clips);
  const client = await new Twitch(
    process.env.TWITCH_CLIENT_ID as string,
    process.env.TWITCH_CLIENT_SECRET as string
  ).init();

  client
    .get("users", { login: "sodapoppin" })
    .then((data) => console.log(data));
}

// setInterval(() => main(), 3 * 1000);

main();
