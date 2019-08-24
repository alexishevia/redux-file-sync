/* eslint no-param-reassign: [0] */

import { applyMiddleware, createStore, compose } from 'redux';
import thunk from "redux-thunk";
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

  const store = createStore(reduxFileSync.reducer, compose(applyMiddleware(thunk)));

  const syncThunk = () => (dispatch, getState) => {
    return reduxFileSync.sync({
      store: { dispatch, getState },
      localStorage: new MemoryLocalStorage(),
      cloudStorage,
    });
  };

  function dispatchActions(actions) {
    actions.forEach(store.dispatch);
  }

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
      return store.dispatch(syncThunk({ cloudStorage }));
    },
    dispatchActions,
  };
}
