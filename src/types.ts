export * from "./twitch/types";
export * from "./video-merge/types";
export * from "./youtube/types";
export * from "./config/types";

export type Metadata = {
    games: string[];
    broadcasters: string[];
    clipCount: number;
}