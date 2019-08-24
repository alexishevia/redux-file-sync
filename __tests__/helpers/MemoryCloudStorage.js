export default function MemoryCloudStorage() {
  let text = "";
  let revision = 0;

  function revisionStr() {
    return `${revision}`;
  }

  function getLatestRevision() {
    return Promise.resolve(revisionStr());
  }

  function increaseRevision() {
    revision += 1;
  }

  function push({ text: newText, revision: providedRevision }) {
    if (revisionStr() !== providedRevision) {
      return Promise.reject(new Error("Conflict"));
    }
    text = newText;
    increaseRevision();
    return Promise.resolve();
  }

  return {
    get text() {
      return text;
    },
    get revision() {
      return revisionStr();
    },
    getLatestRevision,
    pull: () => Promise.resolve(),
    push
  };
}
