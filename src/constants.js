export const UNKNOWN = "UNKNOWN"; // sync has never run, but there are no pending changes either
export const SYNCED = "SYNCED"; // no pending changes
export const PENDING = "PENDING"; // there are pending changes since last sync
export const RUNNING = "RUNNING"; // sync is currently executing
export const FAILED = "FAILED"; // last sync failed
export const ONE_MINUTE = 60 * 1000;
export const TIMEOUT = ONE_MINUTE;
