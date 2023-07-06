import PocketBase from "pocketbase"

function pocketbase() {
  if (process.env.NODE_ENV === "development") {
    const pb = new PocketBase("https://dearyouapi.moveto.kr")
    pb.autoCancellation(false)
    return pb
  } else {
    const pb = new PocketBase("https://dearyouapi.moveto.kr")
    return pb
  }
}

const pb = pocketbase()

export default pb
