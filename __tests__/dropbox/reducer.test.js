import { createStore } from 'redux';
import ReduxFileSync from "../../src";
import { selectors, actions } from "../../src/dropbox";

const { isLoggedIn, isFileSelected, getAccessToken, getFilePath } = selectors;
const { LOGIN, LOGOUT, SELECT_FILE } = actions;

const rootReducer = (state) => state;

const reduxFileSync = ReduxFileSync(rootReducer, {
  whitelist: ["foo"],
  actionsToSync: ["bar"],
});

let store;

// The dropbox reducer is embedded inside the ReduxFileSync reducer
describe("dropbox reducer", () => {
  beforeEach(() => {
    store = createStore(reduxFileSync.reducer);
  });

  describe("initial state", () => {
    it("is logged out", () => {
      expect(isLoggedIn(store.getState())).toEqual(false);
    });

    it("has no file selected", () => {
      expect(isFileSelected(store.getState())).toEqual(false);
    });
  });

  describe("after LOGIN", () => {
    beforeEach(() => {
      store.dispatch({ type: LOGIN, payload: 'mockAccessToken' });
    });

    it("is logged in", () => {
      expect(isLoggedIn(store.getState())).toEqual(true);
    });

    it("has no file selected", () => {
      expect(isFileSelected(store.getState())).toEqual(false);
    });

    it("returns the accessToken", () => {
      expect(getAccessToken(store.getState())).toEqual('mockAccessToken');
    });

    describe("after LOGOUT", () => {
      beforeEach(() => {
        store.dispatch({ type: LOGOUT });
      });

      it("is logged out", () => {
        expect(isLoggedIn(store.getState())).toEqual(false);
      });
    });

    describe("after SELECT_FILE", () => {
      beforeEach(() => {
        store.dispatch({ type: SELECT_FILE, payload: '/path/to/file' });
      });

      it("is logged in", () => {
        expect(isLoggedIn(store.getState())).toEqual(true);
      });

      it("has a file selected", () => {
        expect(isFileSelected(store.getState())).toEqual(true);
      });

      it("returns the filepath", () => {
        expect(getFilePath(store.getState())).toEqual('/path/to/file');
      });
    });
  });
});
