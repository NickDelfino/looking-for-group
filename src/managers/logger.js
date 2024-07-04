import { v4 as uuidv4 } from "uuid";

export async function logMessage(env, message) {
  const id = uuidv4();
  env.errors.put(id, message);
}
