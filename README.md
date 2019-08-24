# redux file sync
Sync your redux actions to a cloud storage file system.

Read the full documentation: https://alexishevia.github.io/redux-file-sync/

## Development Info

### Getting Started

- Install nodeJS (v10.15.0 preferred)
- Run `npm install` to install all dependencies

### Running Tests

```
# Run all tests
npm run test

# Run a single test
npm run test <filename or path>
eg:
  npm run test my-test

# Run test using a debugger
npm run test-debug <filename>
eg:
  npm run test-debug my-test
```

### Linting / Formatting Code

This project is configured to run [prettier](https://github.com/prettier/prettier) when you do a `git add` (using [husky](https://www.npmjs.com/package/husky) and [lint-staged](https://www.npmjs.com/package/lint-staged)), so you don't need to worry about formatting code.

However, we still use [eslint](https://eslint.org/) to capture syntax errors. The `.eslintrc.json` file is set to extend [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier), so eslint will only report on syntax errors instead of enforcing formatting.

Note:  
Some editors will fail to load eslint from a pacakage's subdirectory, and will default to the global eslint - which might not have all the plugins you need.

If that happens, you'll need to manually specify the path to the correct `eslint`.

In my case, I had to create a local `.vimrc` file with:

```
let g:syntastic_javascript_eslint_exec='/home/alexishevia/Projects/Personales/redux-file-sync/node_modules/.bin/eslint'
```

### Publish to npm

Run the following to publish the package to npm:

```
npm run build && npm publish
```

### Documentation

The home page for the project lives in: https://alexishevia.github.io/redux-file-sync

It is generated from this repo's `docs` directory using [Docsify](https://docsify.js.org).

You can run Docsify locally with:

```
npm run docs
```

Note:  
Any PR that changes the architecture should also include updates to the Docsify documentation (to avoid code and docs going out of sync).
