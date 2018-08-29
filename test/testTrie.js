const Trie = require("../lib/trie");

const rules = [
  "a/b/c",
  "a/+/b",
  "a/+/c",
  "a/b",
  "a/c/d/e",
  "a/#",
  "d/e/f/g",
  "d/e/f",
  "h",
  "i/"
];
const tests = ["a/b/c", "a/b", "a/c/d/e", "d/e/f", "d/e/f/g", "h", "i", "i/"];

const root = new Trie();
rules.map((r, i) => {
  console.log("adding", r);
  root.add(r.split("/"), r);
});

root.add("d/e/f".split("/"), "blah");

tests.map((t, i) => {
  console.log("lookup", t, "results in", root.match(t.split("/")));
});

root.remove("d/e/f/g".split("/"), "d/e/f/g");
tests.map((t, i) => {
  console.log("lookup", t, "results in", root.match(t.split("/")));
});

//console.log(JSON.stringify(root, null, 2));
