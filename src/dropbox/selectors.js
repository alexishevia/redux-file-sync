export function getAccessToken(state) {
  return state.reduxFileSync.dropbox.accessToken;
};

export function getFilePath(state) {
  return state.reduxFileSync.dropbox.filepath;
};

export function isLoggedIn(state) {
  return !!getAccessToken(state);
};

export function isFileSelected(state) {
  return !!getFilePath(state);
};

