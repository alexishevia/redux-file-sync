/* eslint no-underscore-dangle:[0] */

export const UNKNOWN = "UNKNOWN"; // sync has never run, but there are no pending changes either
export const SYNCED = "SYNCED"; // no pending changes
export const PENDING = "PENDING"; // there are pending changes since last sync
export const RUNNING = "RUNNING"; // sync is currently executing
export const FAILED = "FAILED"; // last sync failed
export const ONE_MINUTE = 60 * 1000;
export const TIMEOUT = ONE_MINUTE;

export function getLocalActions(state) {
  return (state.reduxFileSync && state.reduxFileSync.localActions) || [];
}

export function getSyncState(state) {
  const { startedAt = 0, succeededAt = 0, failedAt = 0 } = state.reduxFileSync || {};
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
  return state.reduxFileSync && state.reduxFileSync.errorMessage;
}

export function isSyncRunning(state) {
  return getSyncState(state) === RUNNING;
}
