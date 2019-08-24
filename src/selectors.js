/* eslint no-underscore-dangle:[0] */


import { UNKNOWN, SYNCED, PENDING, RUNNING, FAILED, TIMEOUT } from "./constants"

export function getLocalActions(state) {
  return (state._sync && state._sync.localActions) || [];
}

export function getSyncState(state) {
  const { startedAt = 0, succeededAt = 0, failedAt = 0 } = state._sync || {};
  if (startedAt > succeededAt && startedAt > failedAt) {
    const now = new Date().getTime();
    return now - startedAt > TIMEOUT ? FAILED : RUNNING;
  }
  if (failedAt >= succeededAt) {
    return FAILED;
  }
  if (getLocalActions(state).length) {
    return PENDING;
  }
  return succeededAt > 0 ? SYNCED : UNKNOWN;
}

export function getErrorMessage(state) {
  return state._sync && state._sync.errorMessage;
}

export function isSyncRunning(state) {
  return getSyncState(state) === RUNNING;
}
