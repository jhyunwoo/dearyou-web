import PocketBase from "pocketbase";

function pocketbase() {
  if (process.env.NODE_ENV === "development") {
    const pb = new PocketBase("http://127.0.0.1:8090");
    pb.autoCancellation(false);
    return pb;
  } else {
    const pb = new PocketBase("https://dearyouapi.moveto.kr");
    return pb;
  }
}

const pb = pocketbase();

export default pb;
