import { z } from "zod";
import yaml from "js-yaml";

// Schema definitions
const RoleEnum = z.enum(["assistant", "developer", "system", "tool", "user"]);
type Role = z.infer<typeof RoleEnum>;

const MessageSchema = z
  .object({
    content: z.string(),
    role: RoleEnum,
  })
  .passthrough();

const LLMRequestConfigSchema = z.object({
  frequency_penalty: z.number().optional(),
  logit_bias: z.record(z.string(), z.number()).optional(),
  max_tokens: z.number().optional(),
  model: z.string(),
  presence_penalty: z.number().optional(),
  stream: z.boolean().optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
});

type Message = z.infer<typeof MessageSchema>;
type LLMRequestConfig = z.infer<typeof LLMRequestConfigSchema>;

export function jsonToMd(jsonStr: string): string {
  const llmRequestConfig = JSON.parse(jsonStr);

  if (!("messages" in llmRequestConfig)) {
    throw new Error("Messages key not found in JSON");
  }

  const messages = llmRequestConfig.messages.map((msg: unknown) =>
    MessageSchema.parse(msg)
  );

  const { messages: _, ...configWithoutMessages } = llmRequestConfig;
  const parsedConfig = LLMRequestConfigSchema.parse(configWithoutMessages);

  // Remove undefined values for yaml dump
  const cleanConfig = Object.fromEntries(
    Object.entries(parsedConfig).filter(([_, v]) => v !== undefined)
  );

  let s = "";
  const metadata = yaml.dump(cleanConfig).trim();
  s += `---\n${metadata}\n---\n`;

  for (const message of messages) {
    s += `\n# ${message.role}\n`;
    s += `\n${message.content}\n`;
    s += "\n---\n";
  }

  return s;
}

export function mdToJson(mdStr: string): string {
  const pattern = /^---\n(.*?)\n---\n(.*)/s;
  const match = mdStr.match(pattern);

  if (!match) {
    throw new Error("Cannot parse Markdown string");
  }

  const yamlStr = match[1];
  if (!yamlStr) {
    throw new Error("Front matter is empty");
  }

  const llmRequestConfig = yaml.load(yamlStr) as Record<string, unknown>;

  if (!("model" in llmRequestConfig)) {
    throw new Error("Model key not found in front matter");
  }

  const msgsStr = match[2];
  if (!msgsStr) {
    throw new Error("Content after front matter is empty");
  }

  const roles = ["system", "user", "assistant", "developer", "tool"];
  const messagePattern = new RegExp(
    `\n# (${roles.join("|")})\n\n` +
      `(.*?)\n\n---(?=(?:\n\n# (?:${roles.join("|")})\n\n|\\s*$))`,
    "gs"
  );

  const messages: Message[] = [];
  let messageMatch: RegExpExecArray | null;

  while ((messageMatch = messagePattern.exec(msgsStr)) !== null) {
    messages.push({
      role: messageMatch[1] as Role,
      content: messageMatch[2],
    });
  }

  if (messages.length === 0) {
    throw new Error("No messages found");
  }

  // Validate the final structure
  const finalConfig = {
    ...llmRequestConfig,
    messages,
  };

  const jsonStr = JSON.stringify(finalConfig, null, 2);
  return jsonStr;
}
