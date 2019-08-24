# redux file sync
Sync your redux actions to a cloud storage file system.

## The problem
- You built a mobile app using [Redux](https://redux.js.org/) for data management.
- You want to sync data between two or more app instances (phone + tablet, two users that share data, etc).
- You do not want to set up and maintain a backend just to sync data.

## The solution
redux-file-sync lets you sync two or more app instances using a cloud storage file system (eg: Dropbox).

## Usage
1. Install redux-file-sync:
    ```
    npm install --save redux-file-sync
    ```

2. Wrap your root reducer with the provided ReduxFileSync constructor:
    ```
    // reduxFileSync.js
    import ReduxFileSync from 'redux-file-sync';
    import rootReducer from './yourRootReducer';

    const reduxFileSync = new ReduxFileSync(rootReducer, {
      actionsToSync: [
        "todos/create",
        "todos/check",
        "todos/uncheck",
      ],
      whitelist: ["todos"],
    });

    export default reduxFileSync;
    ```

    The `ReduxFileSync` constructor accepts two arguments:
    - `rootReducer`: your top-level redux reducer.
    - `config`
      - `actionsToSync`: actions to sync.  
      Only the actions specified in `actionsToSync` will be uploaded to the cloud file.
      - `whitelist`: fields to sync.  
      When changes are downloaded, only fields in `whitelist` will be updated on the local redux store.

3. Create your redux store using the reducer returned by reduxFileSync:

    ```
    // app.js
    import { applyMiddleware, createStore, compose } from 'redux';
    import thunk from 'redux-thunk';
    import reduxFileSync from './reduxFileSync';

    const store = createStore(reduxFileSync.reducer, compose(applyMiddleware(thunk)));
    ```

4. Finally, run the `sync()` function whenever you want to synchronize your local store to the cloud file:
    ```
    // syncThunk.js
    import { AsyncStorage } from 'react-native';
    import { provider, getAccessToken, getFilePath } from 'redux-file-sync/dropbox';
    import reduxFileSync from './reduxFileSync';

    const syncThunk = () => (dispatch, getState) => {
      const state = getState();
      const accessToken = getAccessToken(state);
      const path = getFilePath(state);

      return reduxFileSync.sync({
        store: { dispatch, getState },
        localStorage: AsyncStorage,
        cloudStorage: provider({ accessToken, path })
      });
    };

    export default syncThunk;
    ```

    The `sync` function accepts a single argument, which must be an object with:
    - `store`: Either the redux store or a similar object with `dispatch()` and `getState()` functions.
    - `localStorage`: [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage) or an object with a compatible API.
    - `cloudStorage`: Dropbox is the only cloud storage provider supported in this initial version.  
        The Dropbox provider requires the user's access token and the path to the cloud file. If you're using the [Dropbox FilePicker](#dropbox-filepicker), you can obtain these using the `getAccessToken` and `getFilePath` selectors. If you're not, make sure to pass a valid `accessToken` and `path` to the Dropbox provider.

    Note: In this example I'm running `sync()` inside a [thunk](https://github.com/reduxjs/redux-thunk). You might choose to use a different pattern.

    Example component using the syncThunk defined above:

    ```
    // YourComponent.js
    import React from 'react';
    import { connect } from 'react-redux';
    import syncThunk from './syncThunk';

    class YourComponent extends React.Component {
        componentDidMount() {
          this.props.runSync();
        }

        ...
    }

    const mapStateToProps = () => ({});

    const mapDispatchToProps = dispatch => ({
        runSync: () => dispatch(syncThunk())
    });

    export default connect(mapStateToProps, mapDispatchToProps)(YourComponent);
    ```

## Dropbox FilePicker
If you are using [expo](https://docs.expo.io), you can use the provided Dropbox `<FilePicker />` component to allow your users to connect to Dropbox and choose the file to sync against.

```
import { FilePicker } from 'redux-file-sync/dropbox';

class Settings extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>Settings</Text>
        <FilePicker key="YOUR_APP_KEY" />
      </View>
    )
  }
}
```

The FilePicker requires your "App key", which is available on the [Dropbox App console](https://www.dropbox.com/developers/apps).

## Sync Status
If you want to know the sync status, you can use the provided `getSyncState()` and `getErrorMessage()` selectors:

```
import {
  getSyncState, getErrorMessage, SYNCED, RUNNING, PENDING, FAILED, UNKNOWN,
} from 'redux-file-sync/lib/selectors'

class YourComponent extends React.Component {
  render() {
    const { syncState, errorMessage } = this.props;
    switch(syncState) {
      case SYNCED:
        return <Text>All changes have been synced.</Text>
      case RUNNING:
        return <Text>Sync is currently running.</Text>
      case FAILED:
        return <Text>Sync Failed: {errorMessage}</Text>
      case PENDING:
        return <Text>Some local changes have not been synced yet.</Text>
      case UNKNOWN:
      default:
        return <Text>Could not figure out sync status.</Text>
    }
  }
}

const mapStateToProps = state => ({
  syncState: getSyncState(state),
  errorMessage: getErrorMessage(state)
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(YourComponent);
```

## How Does redux-file-sync Work?
redux-file-sync applications are "offline-first". They store actions locally,
and will sync to the cloud file when the internet connection allows it.

The core ideas behind redux-file-sync are:
1. The cloud file works like an append-only log. Redux actions are appended to the cloud file, one action per line.
2. If two or more applications process the same cloud file, they should end up in the same state.
3. Local actions are not "final" until they're written to the cloud file.

redux-file-sync applications keep data in three places:

1. cloud file  
   The cloud file is a [Newline Delimited JSON](http://ndjson.org/) file that lives
   in a cloud storage file system (eg: Dropbox). It is considered the source of truth.
2. local file  
   A JSON file kept in `AsyncStorage` that stores the following data:
   - `path`: path to the cloud file.
   - `text`: local copy of the cloud file's text.
   - `revision`: last known `revision` of the cloud file.
   - `lineCount`: last known line count for the cloud file.
   - `store`: serialized redux store built by processing all actions in the cloud file.
3. redux store  
   This is the plain-old store you would see in any redux application. It is kept in memory, but should also be persisted to disk using  something like [redux-persist](https://github.com/rt2zz/redux-persist).  
   redux-file-sync adds a `_sync` property to the redux store. The `_sync.localActions[]` array stores actions that have been executed locally but have not been written to the cloud file yet.

Synchronization is executed in 4 steps, which run in sequential order:

1. Download cloud file  
    Changes in the cloud file are appended to the local file.
2. Append local actions  
    Actions in `_sync.localActions[]` are appended to the local file.
3. Upload local file  
    The local file's text is uploaded to the cloud file.
3. Update local store  
    The redux store is overwritten with the local file's store, and `sync.localActions[]` is reset.
