// actions used by the sync reducer
export const START = "__sync_start__";
export const SUCCESS = "__sync_success__";
export const FAIL = "__sync_fail__";
export const REHYDRATE = "__sync_restore__";
export const REMOVE_ACTIONS = "__sync_remove_actions__";

export function start(time) {
  return { type: START, payload: time };
}

export function success(time) {
  return { type: SUCCESS, payload: time };
}

export function fail({ time, errorMessage } = {}) {
  return { type: FAIL, payload: { time, errorMessage } };
}

export function rehydrateStore(newStoreState) {
  return { type: REHYDRATE, payload: newStoreState };
}

export function removeLocalActions(actionsToRemove) {
  return { type: REMOVE_ACTIONS, payload: actionsToRemove };
}
