import pb from "./pocketbase";

export async function getUserName(userId) {
  const record = await pb.collection("users").getOne(userId);
  return record.name;
}
