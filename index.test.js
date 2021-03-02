const assert = require("assert");
const {translateFunctionFactory} = require(".");

const l10n = {
  "foo": "bar",
  "hotel": "trivago",
  "alpha": "there's a simple item",
  "beta": "there's a {item} with replacement",
  "gamma": "there's a letter for {receiver}, from {sender}",
  "delta": "you could stop and five or six stores, or, just {n}",
  "delta_plural": "Gee Bill! How come your mom lets you eat {n} weiners?",
  "nested": {
    "values": "am I right?",
    "replacements": "Datawheel's biggest projects are {first}, {second}, and {third}."
  }
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

  it("should return a term from translation dict, and perform a plural replacement", () => {
    assert.strictEqual(t("delta", {n: 1}), "you could stop and five or six stores, or, just 1");
    assert.strictEqual(t("delta", {n: 2}), "Gee Bill! How come your mom lets you eat 2 weiners?");
  });

  it("should return the same key if term is not in translation dict", () => {
    assert.strictEqual(t("key"), "key");
    assert.strictEqual(t("Foo"), "Foo");
  });

  it("should return the same key if term is not in translation dict, and perform a replacement", () => {
    assert.strictEqual(t("a variable {foo} used for examples", {foo: "bar"}), "a variable bar used for examples");
  });

  it("should return a term using a nested key from translation dict", () => {
    assert.strictEqual(t("nested.values"), "am I right?");
  });

  it("should return a term using a nested key from translation dict, and perform a value replacement", () => {
    assert.strictEqual(t("nested.replacements", {first: "the OEC", second: "DataUSA", third: "DataMexico"}), "Datawheel's biggest projects are the OEC, DataUSA, and DataMexico.");
  });
});
