const {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} = require("#SRC/js/constants/TransactionTypes");
const Batch = require("#SRC/js/structs/Batch");
const Transaction = require("#SRC/js/structs/Transaction");
const EnvironmentVariables = require("../EnvironmentVariables");

describe("Environment Variables", function() {
  describe("#JSONReducer", function() {
    it("should return a key value object", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "key"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ key: "value" });
    });

    it("should keep the last value if they have the same key", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "key"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 1, "key"], "key"));
      batch = batch.add(new Transaction(["env", 1, "value"], "value2"));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ key: "value2" });
    });

    it("should keep remove the first item", function() {
      let batch = new Batch();
      batch = batch.add(new Transaction(["env"], 0, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 0, "key"], "first"));
      batch = batch.add(new Transaction(["env", 0, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 1, ADD_ITEM));
      batch = batch.add(new Transaction(["env", 1, "key"], "second"));
      batch = batch.add(new Transaction(["env", 1, "value"], "value"));
      batch = batch.add(new Transaction(["env"], 0, REMOVE_ITEM));

      expect(
        batch.reduce(EnvironmentVariables.JSONReducer.bind({}), {})
      ).toEqual({ second: "value" });
    });
  });

  describe("#JSONParser", function() {
    it("should return an empty array", function() {
      expect(EnvironmentVariables.JSONParser({})).toEqual([]);
    });

    it("should return an array of transactions", function() {
      expect(
        EnvironmentVariables.JSONParser({ env: { key: "value" } })
      ).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "key", path: ["env", 0, "key"] },
        { type: SET, value: "value", path: ["env", 0, "value"] }
      ]);
    });

    it("should keep complex values", function() {
      expect(
        EnvironmentVariables.JSONParser({ env: { foo: { secret: "value" } } })
      ).toEqual([
        { type: ADD_ITEM, value: 0, path: ["env"] },
        { type: SET, value: "foo", path: ["env", 0, "key"] },
        { type: SET, value: { secret: "value" }, path: ["env", 0, "value"] }
      ]);
    });
  });
});
