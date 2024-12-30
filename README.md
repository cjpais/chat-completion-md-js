# Chat Completion MD (TypeScript)

A TypeScript port of [chat-completion-md](https://github.com/S1M0N38/chat-completion-md) that converts between JSON and Markdown formats for OpenAI chat completions.

This project provides utilities to convert between JSON format (used for OpenAI's Chat Completion API) and a more readable Markdown format, making it easier to work with and version control your prompts.

## 🙏 Attribution

This project is a TypeScript port of [chat-completion-md](https://github.com/S1M0N38/chat-completion-md) by [S1M0N38](https://github.com/S1M0N38). The original project was written in Python, and this version maintains the same functionality while leveraging TypeScript and Zod for type safety and validation.

## 🚀 Installation

```bash
# Using bun
bun add chat-completion-md-ts

# Using npm
npm install chat-completion-md-ts

# Using yarn
yarn add chat-completion-md-ts
```

## 📖 Usage

### JSON to Markdown

Convert a JSON chat completion request to a markdown format:

```typescript
import { jsonToMd } from 'chat-completion-md-ts';

const json = `{
  "model": "gpt-4",
  "temperature": 0.7,
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}`;

const markdown = jsonToMd(json);
console.log(markdown);
```

Output:
```markdown
---
model: gpt-4
temperature: 0.7
---

# system

You are a helpful assistant.

---

# user

Hello, how are you?

---
```

### Markdown to JSON

Convert a markdown format back to JSON for use with the OpenAI API:

```typescript
import { mdToJson } from 'chat-completion-md-ts';

const markdown = `---
model: gpt-4
temperature: 0.7
---

# system

You are a helpful assistant.

---

# user

Hello, how are you?

---`;

const json = mdToJson(markdown);
console.log(JSON.parse(json));
```

## 🔍 Validation

This library uses [Zod](https://github.com/colinhacks/zod) for runtime type checking and validation. It will validate:

- Required fields (e.g., `model`)
- Message roles (`system`, `user`, `assistant`, `developer`, `tool`)
- Data types for all fields
- Structure of the JSON and Markdown

## 🏗️ Schema

### LLM Request Config
```typescript
{
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  max_tokens?: number;
  model: string;
  presence_penalty?: number;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
}
```

### Message
```typescript
{
  content: string;
  role: "assistant" | "developer" | "system" | "tool" | "user";
}
```

## 🧪 Testing

Tests are written using Bun's test runner. To run the tests:

```bash
bun test
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find a bug or have a feature request, please create an issue on the GitHub repository.