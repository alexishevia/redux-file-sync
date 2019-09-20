import { createStore } from "redux";

const KEY = "REDUX_FILE_SYNC_KEY";

export default function LocalFile({ localStorage, cloudStorage, reducer }) {
  let path;
  let text;
  let revision;
  let lineCount;
  let store;

  function reset() {
    path = "";
    text = "";
    revision = null;
    lineCount = -1;
    store = createStore(reducer);
  }

  reset();

  // load() fetches data from localStorage
  async function load() {
    const str = await localStorage.getItem(KEY);
    if (!str) return;
    let initialState;
    ({ path, text, revision, lineCount, store: initialState } = JSON.parse(
      str
    ));
    store = createStore(reducer, initialState);
  }

  // save() stores values into localStorage
  async function save() {
    await localStorage.setItem(
      KEY,
      JSON.stringify({
        path,
        text,
        revision,
        lineCount,
        store: store.getState()
      })
    );
  }

  // process() runs actions through the store.
  // Note: ignores lines that have been processed before.
  function process() {
    text.split("\n").forEach((str, i) => {
      if (i <= lineCount) return;
      lineCount = i;
      if (!str) return;
      const action = JSON.parse(str);
      store.dispatch(action);
    });
  }

  // pull() fetches data from cloudStorage
  // Note: also updates localStorage.
  async function pull({ reprocessAll } = {}) {
    await load();
    if (cloudStorage.path !== path || reprocessAll) {
      reset();
    }
    ({ path } = cloudStorage);
    const latestRevision = await cloudStorage.getLatestRevision();
    if (latestRevision === revision) return;
    await cloudStorage.pull();
    ({ text, revision } = cloudStorage);
    process();
    await save();
  }

  // push() saves data into cloudStorage
  // Note: also updates localStorage.
  async function push() {
    await cloudStorage.push({ text, revision });
    ({ revision } = cloudStorage);
    await save();
  }

  // appendActions() adds new actions to the localFile and processes them
  function appendActions(actions) {
    if (!actions.length) return;
    text = [text, ...actions.filter(Boolean).map(JSON.stringify)].join("\n");
    process();
  }

  // public interface
  return {
    get text() {
      return text;
    },
    get revision() {
      return revision;
    },
    get lineCount() {
      return lineCount;
    },
    get store() {
      return store;
    },
    save,
    pull,
    push,
    appendActions
  };
}
