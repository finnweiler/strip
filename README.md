# json**strip**

Paste JSON, remove fields you don't need, copy the result.

A client-side tool for stripping unnecessary fields from large JSON files. Useful for cleaning up API responses, reducing token count before sending to LLMs, or extracting only the data you need.

## Features

- **Schema detection** — automatically detects the structure of your JSON, merging arrays of similar objects into a unified schema
- **Toggle fields** — check/uncheck fields in the tree to include or exclude them from the output
- **Size indicators** — see how many bytes each field contributes, so you know what to cut
- **Copy minified or formatted** — get the stripped result as compact single-line JSON (great for LLM prompts) or pretty-printed
- **Handles large files** — JSON processing runs in a Web Worker to keep the UI responsive
- **Light / Dark / System theme** — adapts to your preference
- **Fully client-side** — nothing leaves your browser

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) components
- [next-themes](https://github.com/pacocoursey/next-themes) for theme switching
- Web Workers for off-thread JSON processing

## How It Works

1. **Paste** JSON into the input textarea
2. The app parses the JSON and builds a **schema tree** showing all fields, types, occurrence counts, and byte sizes
3. **Uncheck** any fields you want to remove
4. The stripped JSON is generated in a **Web Worker** and shown in the preview panel
5. **Copy** the result — minified (no whitespace) or formatted (indented)

## Project Structure

```
app/
  layout.tsx          — Root layout with ThemeProvider
  page.tsx            — Renders <JsonStripper />
  globals.css         — Theme variables (light + dark), custom utilities

components/
  json-stripper.tsx   — Main two-column layout
  json-input.tsx      — Textarea with error display
  schema-tree.tsx     — Tree wrapper with select/deselect all
  schema-tree-node.tsx — Recursive checkbox tree node
  json-preview.tsx    — Formatted/minified output with copy buttons
  theme-toggle.tsx    — System/light/dark cycle button

hooks/
  use-json-stripper.ts — All state, derived values, and worker communication

lib/
  json-schema.ts      — Schema detection and tree types
  json-strip.ts       — JSON stripping, parsing, size estimation
  strip-worker.ts     — Web Worker for strip + stringify
```

## License

MIT
