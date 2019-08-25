import { START, SUCCESS, FAIL, REHYDRATE, REMOVE_ACTIONS } from "./actions";
import dropboxReducer from "./dropbox/reducer";

const initialState = {
  startedAt: 0,
  succeededAt: 0,
  failedAt: 0,
  errorMessage: null,
  localActions: [],
  dropbox: {},
};

function pick(obj, keys) {
  return Object.entries(obj).reduce((memo, [key, val]) => {
    return keys.includes(key) ? { ...memo, [key]: val } : memo;
  }, {});
}

export default function syncReducer(
  baseReducer,
  { whitelist = [], actionsToSync = [] }
) {
  return function reduce(state = {}, action) {
    let newState = state.reduxFileSync ? state : { ...state, reduxFileSync: initialState };

    if (action.type === START) {
      const startedAt = action.payload || new Date().getTime();
      newState = { ...state, reduxFileSync: { ...state.reduxFileSync, startedAt } };
    }

    if (action.type === SUCCESS) {
      const succeededAt = action.payload || new Date().getTime();
      newState = { ...state, reduxFileSync: { ...state.reduxFileSync, succeededAt } };
    }

    if (action.type === FAIL) {
      const payload = action.payload || {};
      const { time, errorMessage } = payload;
      const failedAt = time || new Date().getTime();
      newState = {
        ...state,
        reduxFileSync: { ...state.reduxFileSync, failedAt, errorMessage }
      };
    }

    if (action.type === REHYDRATE) {
      newState = { ...state, ...pick(action.payload, whitelist) };
    }

    if (action.type === REMOVE_ACTIONS) {
      const actionsToRemove = action.payload || [];
      const localActions = (
        (state.reduxFileSync && state.reduxFileSync.localActions) ||
        []
      ).filter(ac => !actionsToRemove.includes(ac));
      newState = { ...state, reduxFileSync: { ...state.reduxFileSync, localActions } };
    }

    if (actionsToSync.includes(action.type)) {
      const localActions = [
        ...((state.reduxFileSync && state.reduxFileSync.localActions) || []),
        action
      ];
      newState = { ...state, reduxFileSync: { ...state.reduxFileSync, localActions } };
    }

    const newDropboxState = dropboxReducer(newState.reduxFileSync.dropbox, action);
    if (newDropboxState !== newState.reduxFileSync.dropbox) {
      newState = {
        ...newState,
        reduxFileSync: { ...newState.reduxFileSync, dropbox: newDropboxState }
      };
    }

    return baseReducer(newState, action);
  };
}
