import getFileRevision from "./api/getFileRevision";
import loadFile from "./api/loadFile";
import writeFile from "./api/writeFile";

export default function DropboxCloudFile({ accessToken, path } = {}) {
  if (!accessToken || !path) {
    throw new Error("Dropbox is not connected.");
  }

  let text = "";
  let revision = null;

  // getLatestRevision() fetches revision value from Dropbox
  // (not from local value)
  async function getLatestRevision() {
    const result = await getFileRevision({ accessToken, path });
    return result;
  }

  // pull() fetches data from Dropbox
  async function pull() {
    const newValues = await loadFile({ accessToken, path });
    ({ text, revision } = newValues);
  }

  // push() saves data to Dropbox
  async function push({ text: newText, revision: prevRevision }) {
    text = newText;
    const newValues = await writeFile({
      accessToken,
      path,
      text,
      revision: prevRevision
    });
    ({ revision } = newValues);
  }

  // public interface
  return {
    get text() {
      return text;
    },
    get revision() {
      return revision;
    },
    get path() {
      return path;
    },
    getLatestRevision,
    pull,
    push
  };
}
