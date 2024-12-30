// jsonToMd.test.ts
import { expect, test, describe } from "bun:test";
import { join } from "path";
import { jsonToMd } from "../src";
import fs from "fs";

const dataPath = join(import.meta.dir, "data", "json_to_md");

describe("jsonToMd", () => {
  // Helper function to get sorted file paths
  const getFiles = (pattern: RegExp) => {
    return fs
      .readdirSync(dataPath)
      .filter((filename) => filename.match(pattern))
      .sort()
      .map((filename) => join(dataPath, filename));
  };

  const exampleJsons = getFiles(/example_.*\.json$/);
  const exampleMds = getFiles(/example_.*\.md$/);

  // Test examples
  exampleJsons.forEach((jsonFile, index) => {
    test(`example ${index + 1}`, async () => {
      const jsonStr = await Bun.file(jsonFile).text();
      const mdStr = await Bun.file(exampleMds[index]).text();
      const output = jsonToMd(jsonStr);
      expect(output).toBe(mdStr);
    });
  });

  test("not valid json", async () => {
    const jsonStr = await Bun.file(
      join(dataPath, "not_valid_json.json")
    ).text();
    expect(() => jsonToMd(jsonStr)).toThrow();
  });

  test("missing messages", async () => {
    const jsonStr = await Bun.file(
      join(dataPath, "missing_messages.json")
    ).text();
    expect(() => jsonToMd(jsonStr)).toThrow("Messages key not found in JSON");
  });

  test("missing model", async () => {
    const jsonStr = await Bun.file(join(dataPath, "missing_model.json")).text();
    expect(() => jsonToMd(jsonStr)).toThrow();
  });

  test("wrong role", async () => {
    const jsonStr = await Bun.file(join(dataPath, "wrong_role.json")).text();
    expect(() => jsonToMd(jsonStr)).toThrow();
  });
});
