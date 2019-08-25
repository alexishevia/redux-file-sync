import { Dropbox } from "dropbox";
import { isNewFile } from "../errors";
import { NEW_FILE_REVISION } from "../constants";

const readFileBlob = fileBlob =>
  new Promise((resolve, reject) => {
    try {
      const reader = new global.FileReader();
      reader.addEventListener("loadend", () => {
        resolve(reader.result);
      });
      reader.addEventListener("error", err => {
        reject(err);
      });
      reader.readAsText(fileBlob, "UTF-8");
    } catch (err) {
      reject(err);
    }
  });

export default async function dropboxLoadFile({ accessToken, path }) {
  const dropbox = new Dropbox({ fetch: global.fetch, accessToken });
  let response;
  try {
    response = await dropbox.filesDownload({ path });
  } catch (err) {
    if (isNewFile(err)) return { revision: NEW_FILE_REVISION, text: "" };
    throw err;
  }
  const { rev: revision, fileBlob } = response;
  const text = await readFileBlob(fileBlob);
  return { revision, text };
}
