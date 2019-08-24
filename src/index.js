import buildReducer from "./reducer";
import runSync from "./sync";

export default function ReduxFileSync(
  baseReducer,
  { whitelist, actionsToSync, localStorage } = {},
) {
  if (!baseReducer) throw new Error('baseReducer is required');
  if (!localStorage) throw new Error('localStorage is required');
  if (!Array.isArray(whitelist) || !whitelist.length) throw new Error('whitelist is required');
  if (!Array.isArray(actionsToSync) || !actionsToSync.length) throw new Error('actionsToSync is required');

  const reducer = buildReducer(baseReducer, { whitelist, actionsToSync });
  const sync = ({ store, cloudStorage }) => runSync({ store, reducer, localStorage, cloudStorage });

  return {
    get reducer() {
      return reducer;
    },
    get sync() {
      return sync;
    }
  };
}
