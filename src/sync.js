import LocalFile from "./LocalFile";
import { start, success, fail, rehydrateStore, removeLocalActions } from "./actions";
import { isSyncRunning, getLocalActions } from "./selectors";
import stringifyError from "./stringifyError";

export default async function sync({ store, reducer, localStorage, cloudStorage }) {
  if (!store || !store.getState || !store.dispatch)
    throw new Error("store is required");
  if (!reducer) throw new Error('reducer is required');
  if (!localStorage) throw new Error('localStorage is required');
  if (!cloudStorage) throw new Error('cloudStorage is required');

  if (isSyncRunning(store.getState())) {
    console.log("sync is already running. ignoring sync() call");
    return;
  }

  if (!cloudStorage.isReady()) {
    store.dispatch(fail({ errorMessage: 'Cloud storage is not connected.' }));
    return;
  }

  const startTime = new Date().getTime();

  try {
    store.dispatch(start(startTime));

    const localFile = new LocalFile({ reducer, localStorage, cloudStorage });
    await localFile.pull();

    const actionsToUpload = getLocalActions(store.getState());
    if (actionsToUpload.length) {
      localFile.appendActions(actionsToUpload);
      await localFile.push();
    }

    const pendingLocalActions = getLocalActions(store.getState()).filter(
      action => !actionsToUpload.includes(action)
    );
    localFile.appendActions(pendingLocalActions);

    store.dispatch(rehydrateStore(localFile.store.getState()));
    store.dispatch(removeLocalActions(actionsToUpload));
    store.dispatch(success());
  } catch (err) {
    console.log(err);
    store.dispatch(fail({ errorMessage: stringifyError(err) }));
  }
}
