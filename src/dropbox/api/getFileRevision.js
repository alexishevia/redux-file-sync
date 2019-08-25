import { Dropbox } from "dropbox";
import { isNewFile } from "../errors";
import { NEW_FILE_REVISION } from "../constants";

export default async function getFileRevision({ accessToken, path }) {
  const dropbox = new Dropbox({ fetch: global.fetch, accessToken });
  let data;
  try {
    data = await dropbox.filesGetMetadata({ path });
  } catch (err) {
    if (isNewFile(err)) return NEW_FILE_REVISION;
    throw err;
  }
  if (data[".tag"] !== "file" || !data.rev) {
    throw new Error(`The provided path does not point to a file: ${path}`);
  }
  return data.rev;
}
