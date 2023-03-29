import PocketBase from "pocketbase";

const pb = new PocketBase("https://dearu-pocket.moveto.kr");

if (process.env.NODE_ENV === "development") pb.autoCancellation(false);

export default pb;
