/* eslint no-param-reassign: [0] */

import { createStore } from 'redux';
import ReduxFileSync from "../../src";
import { getLocalActions, getSyncState } from "../../src/selectors";
import MemoryLocalStorage from './MemoryLocalStorage';
import MemoryCloudStorage from './MemoryCloudStorage';
import rootReducer from './rootReducer';

export default function TestApp({ cloudStorage } = {}) {
  cloudStorage = cloudStorage || new MemoryCloudStorage();

  const reduxFileSync = ReduxFileSync(rootReducer, {
    whitelist: ["todos"],
    actionsToSync: ["todos/add", "todos/check", "todos/uncheck", "todos/delete"],
  });

  const store = createStore(reduxFileSync.reducer);

  return {
    get store() {
      return store;
    },
    get cloudStorage() {
      return cloudStorage;
    },
    get todos() {
      return store.getState().todos;
    },
    get localActions() {
      return getLocalActions(store.getState());
    },
    get syncState() {
      return getSyncState(store.getState());
    },
    sync() {
      return reduxFileSync.sync({
        store,
        localStorage: new MemoryLocalStorage(),
        cloudStorage,
      });
    },
    dispatchActions(actions) {
      actions.forEach(store.dispatch);
    }
  };
}
