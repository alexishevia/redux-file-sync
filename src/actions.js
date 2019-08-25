// actions used by the sync reducer
export const START = "reduxFileSync/start";
export const SUCCESS = "reduxFileSync/success";
export const FAIL = "reduxFileSync/fail";
export const REHYDRATE = "reduxFileSync/restore";
export const REMOVE_ACTIONS = "reduxFileSync/removeActions";

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
