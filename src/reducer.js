/* eslint no-underscore-dangle:[0] */

import { START, SUCCESS, FAIL, REHYDRATE, REMOVE_ACTIONS } from "./actions";

const initialState = {
  startedAt: 0,
  succeededAt: 0,
  failedAt: 0,
  errorMessage: null,
  localActions: []
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
    let newState = state._sync ? state : { ...state, _sync: initialState };

    if (action.type === START) {
      const startedAt = action.payload || new Date().getTime();
      newState = { ...state, _sync: { ...state._sync, startedAt } };
    }

    if (action.type === SUCCESS) {
      const succeededAt = action.payload || new Date().getTime();
      newState = { ...state, _sync: { ...state._sync, succeededAt } };
    }

    if (action.type === FAIL) {
      const payload = action.payload || {};
      const { time, errorMessage } = payload;
      const failedAt = time || new Date().getTime();
      newState = {
        ...state,
        _sync: { ...state._sync, failedAt, errorMessage }
      };
    }

    if (action.type === REHYDRATE) {
      newState = { ...state, ...pick(action.payload, whitelist) };
    }

    if (action.type === REMOVE_ACTIONS) {
      const actionsToRemove = action.payload || [];
      const localActions = (
        (state._sync && state._sync.localActions) ||
        []
      ).filter(ac => !actionsToRemove.includes(ac));
      newState = { ...state, _sync: { ...state._sync, localActions } };
    }

    if (actionsToSync.includes(action.type)) {
      const localActions = [
        ...((state._sync && state._sync.localActions) || []),
        action
      ];
      newState = { ...state, _sync: { ...state._sync, localActions } };
    }

    return baseReducer(newState, action);
  };
}
