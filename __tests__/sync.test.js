import TestApp from "./helpers/TestApp";
import { SYNCED } from "../src/constants"

describe("sync", () => {
  describe("sync a new app to an empty cloud file", () => {
    let app;

    beforeEach(() => {
      app = new TestApp();
      return app.sync();
    });

    it("does not modify todos", () => {
      expect(app.todos).toEqual([]);
    });

    it("does not modify localActions", () => {
      expect(app.localActions).toEqual([]);
    });

    it("sets the sync state to SYNCED", () => {
      expect(app.syncState).toEqual(SYNCED);
    });
  });

  describe("sync an existing app with todos to a new app", () => {
    let oldApp;
    let newApp;

    const actions = [
      { type: 'todos/add', payload: 'take out milk' },
      { type: 'todos/add', payload: 'feed the dogs' },
      { type: 'todos/add', payload: 'use redux-file-sync' },
      { type: 'todos/check', payload: 'take out milk' },
      { type: 'todos/delete', payload: 'feed the dogs' },
    ];

    const expectedTodos = [
      { isChecked: true, text: 'take out milk' },
      { isChecked: false, text: 'use redux-file-sync' },
    ]

    beforeEach(async () => {
      oldApp = new TestApp();
      oldApp.dispatchActions(actions);
      await oldApp.sync();

      newApp = new TestApp({ cloudStorage: oldApp.cloudStorage });
      await newApp.sync();
    });

    it("keeps the existing app todos intact", () => {
      expect(oldApp.todos).toEqual(expectedTodos);
    });

    it("correctly copies the existing todos to the new app", () => {
      expect(newApp.todos).toEqual(expectedTodos);
    });

    it("sets the sync state to SYNCED", () => {
      expect(oldApp.syncState).toEqual(SYNCED);
      expect(newApp.syncState).toEqual(SYNCED);
    });
  });

  describe("sync apps without conflicts", () => {
    let appA;
    let appB;

    const actionsA = [
      { type: 'todos/add', payload: 'take out milk' },
      { type: 'todos/add', payload: 'feed the dogs' },
      { type: 'todos/check', payload: 'take out milk' },
    ];

    const actionsB = [
      { type: 'todos/add', payload: 'use redux-file-sync' },
    ];

    const expectedTodos = [ // assuming appA syncs before appB
      { isChecked: true, text: 'take out milk' },
      { isChecked: false, text: 'feed the dogs' },
      { isChecked: false, text: 'use redux-file-sync' },
    ]

    beforeEach(async () => {
      appA = new TestApp();
      appB = new TestApp({ cloudStorage: appA.cloudStorage });

      appA.dispatchActions(actionsA);
      appB.dispatchActions(actionsB);

      await appA.sync();
      await appB.sync();
      await appA.sync();
      await appB.sync();
    });

    it("syncs todos correctly to the first app", () => {
      expect(appA.todos).toEqual(expectedTodos);
    });

    it("syncs todos correctly to the second app", () => {
      expect(appB.todos).toEqual(expectedTodos);
    });

    it("sets the sync state to SYNCED", () => {
      expect(appA.syncState).toEqual(SYNCED);
      expect(appB.syncState).toEqual(SYNCED);
    });
  });

  describe("sync apps with conflicts", () => {
    let appA;
    let appB;
    let expectedTodos;

    beforeEach(async () => {
      appA = new TestApp();
      appB = new TestApp({ cloudStorage: appA.cloudStorage });

      appA.dispatchActions([
        { type: 'todos/add', payload: 'take out milk' },
        { type: 'todos/add', payload: 'feed the dogs' },
        { type: 'todos/check', payload: 'take out milk' },
      ]);

      expectedTodos = [
        { isChecked: true, text: 'take out milk' },
        { isChecked: false, text: 'feed the dogs' },
      ];

      await appA.sync();
      await appB.sync();

      // up to this point, apps are synced
      expect(appA.todos).toEqual(expectedTodos);
      expect(appB.todos).toEqual(expectedTodos);

      // now, introduce conflicting updates
      appA.dispatchActions([
        { type: 'todos/uncheck', payload: 'take out milk' },
        { type: 'todos/check', payload: 'feed the dogs' },
      ]);
      appB.dispatchActions([
        { type: 'todos/delete', payload: 'take out milk' },
        { type: 'todos/uncheck', payload: 'feed the dogs' },
      ]);
    });

    describe("if app A syncs first", () => {
      beforeEach(async () => {
        await appA.sync();
        await appB.sync();
        await appA.sync();

        expectedTodos = [
          { isChecked: false, text: 'feed the dogs' },
        ];
      });

      it("applies appA actions before appB actions", () => {
        expect(appA.todos).toEqual(expectedTodos);
        expect(appB.todos).toEqual(expectedTodos);
      });
    });

    describe("if app B syncs first", () => {
      beforeEach(async () => {
        await appB.sync();
        await appA.sync();
        await appB.sync();

        expectedTodos = [
          { isChecked: true, text: 'feed the dogs' },
        ];
      });

      it("applies appB actions before appA actions", () => {
        expect(appA.todos).toEqual(expectedTodos);
        expect(appB.todos).toEqual(expectedTodos);
      });
    });
  });
});
