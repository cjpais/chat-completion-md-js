import { expect, test, describe } from "bun:test";
import { join } from "path";
import { mdToJson } from "../src";
import fs from "fs";

const dataPath = join(import.meta.dir, "data", "md_to_json");

describe("mdToJson", () => {
  // Helper function to get sorted file paths
  const getFiles = (pattern: RegExp) => {
    return fs
      .readdirSync(dataPath)
      .filter((filename) => filename.match(pattern))
      .sort()
      .map((filename) => join(dataPath, filename));
  };

  const exampleMds = getFiles(/example_.*\.md$/);
  const exampleJsons = getFiles(/example_.*\.json$/);

  // Test examples
  exampleMds.forEach((mdFile, index) => {
    test(`example ${index + 1}`, async () => {
      const mdStr = await Bun.file(mdFile).text();
      const jsonStr = await Bun.file(exampleJsons[index]).text();
      const output = mdToJson(mdStr);
      expect(JSON.parse(output)).toEqual(JSON.parse(jsonStr));
    });
  });

  test("not valid markdown", async () => {
    const mdStr = await Bun.file(
      join(dataPath, "not_valid_markdown.md")
    ).text();
    expect(() => mdToJson(mdStr)).toThrow("Cannot parse Markdown string");
  });

  test("missing model", async () => {
    const mdStr = await Bun.file(join(dataPath, "missing_model.md")).text();
    expect(() => mdToJson(mdStr)).toThrow(
      "Model key not found in front matter"
    );
  });

  test("missing content", async () => {
    const mdStr = await Bun.file(join(dataPath, "missing_content.md")).text();
    expect(() => mdToJson(mdStr)).toThrow(
      "Content after front matter is empty"
    );
  });

  test("missing messages", async () => {
    const mdStr = await Bun.file(join(dataPath, "missing_messages.md")).text();
    expect(() => mdToJson(mdStr)).toThrow("No messages found");
  });
});
