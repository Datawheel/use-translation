const assert = require("assert");
const {translateFunctionFactory} = require(".");

const l10n = {
  "foo": "bar",
  "hotel": "trivago",
  "alpha": "there's a simple item",
  "beta": "there's a {{item}} with replacement",
  "gamma": "there's a letter for {{receiver}}, from {{sender}}",
  "delta": "I have a counter marking {{n}}",
  "epsilon": "you could stop and five or six stores, or, just {{n}}",
  "epsilon_zero": "This here > \"{{n}}\" < should not be empty",
  "epsilon_plural": "Gee Bill! How come your mom lets you eat {{n}} weiners?",
  "nested": {
    "values": "am I right?",
    "replacements": "Datawheel's biggest projects are {{first}}, {{second}}, and {{third}}."
  },
  "single": "Hello {name}",
  "double": "Hello {{name}}"
};

const t = translateFunctionFactory(l10n);

describe("translateFunctionFactory", () => {
  it("should return a term from translation dict", () => {
    assert.strictEqual(t("foo"), "bar");
    assert.strictEqual(t("hotel"), "trivago");
    assert.strictEqual(t("alpha"), "there's a simple item");
  });

  it("should return a term from translation dict, and perform a value replacement", () => {
    assert.strictEqual(t("beta", {item: "sandwich"}), "there's a sandwich with replacement");
  });

  it("should return a term from translation dict, and perform multiple value replacements", () => {
    assert.strictEqual(t("gamma", {sender: "Alice", receiver: "Bob"}), "there's a letter for Bob, from Alice");
  });

  it("should return a term from translation dict, and perform a simple number replacement", () => {
    assert.strictEqual(t("delta", {n: 0}), "I have a counter marking 0");
    assert.strictEqual(t("delta", {n: 1}), "I have a counter marking 1");
    assert.strictEqual(t("delta", {n: 2}), "I have a counter marking 2");
  });

  it("should return a term from translation dict, and perform a zero/plural replacement", () => {
    assert.strictEqual(t("epsilon", {n: 0}), "This here > \"0\" < should not be empty");
    assert.strictEqual(t("epsilon", {n: 1}), "you could stop and five or six stores, or, just 1");
    assert.strictEqual(t("epsilon", {n: 2}), "Gee Bill! How come your mom lets you eat 2 weiners?");
  });

  it("should return the same key if term is not in translation dict", () => {
    assert.strictEqual(t("key"), "key");
    assert.strictEqual(t("Foo"), "Foo");
  });

  it("should return the same key if term is not in translation dict, and perform a replacement", () => {
    assert.strictEqual(t("a variable {{foo}} used for examples", {foo: "bar"}), "a variable bar used for examples");
  });

  it("should return a term using a nested key from translation dict", () => {
    assert.strictEqual(t("nested.values"), "am I right?");
  });

  it("should return a term using a nested key from translation dict, and perform a value replacement", () => {
    assert.strictEqual(t("nested.replacements", {first: "the OEC", second: "DataUSA", third: "DataMexico"}), "Datawheel's biggest projects are the OEC, DataUSA, and DataMexico.");
  });

  it("should replace a single and double braced variable in the same way", () => {
    const vars = {name: "Tester"};
    assert.strictEqual(t("single", vars), t("double", vars));
  })
});
