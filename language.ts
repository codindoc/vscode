const languageFileExtensions = {
  typescript: "ts",
  javascript: "js",
  markdown: "md",
  dart: "dart",
}

export class DocumentCodeBlock {
  constructor(start: number, end: number, languageID: string) {
    this.start = start
    this.end = end
    this.languageID = languageID
  }

  start: number
  end: number
  languageID: string

  render(raw: string, eol: string) {
    const ln = eol.replace("\n", "\\n").replace("\r", "\\r")
    const regexp = new RegExp(`[^${ln}]`, "g")
    return (
      raw.slice(0, this.start).replace(regexp, " ") +
      raw.slice(this.start, this.end) +
      raw.slice(this.end).replace(regexp, " ")
    )
  }
}

export function parseDocument(
  content: string,
  languageID: string,
  eol: string,
): DocumentCodeBlock[] {
  if (languageID === "markdown") return parseMarkdown(content, eol)
  return []
}

function parseMarkdown(content: string, eol: string): DocumentCodeBlock[] {
  const ln = eol.replace("\n", "\\n").replace("\r", "\\r")
  const codeBlockRegex = new RegExp(
    `(?:^|${ln})\`\`\`([\\w+-]*)${ln}(.*?)${ln}\`\`\`(?=${ln}|$)`,
    "gs",
  )
  const handler: DocumentCodeBlock[] = []
  let match: RegExpExecArray | null = null
  while ((match = codeBlockRegex.exec(content)) !== null) {
    handler.push(
      new DocumentCodeBlock(
        match.index + match[1].length + "```".length + eol.length * 2,
        match.index + match[0].length - "```".length,
        resolveLanguageID(match[1]),
      ),
    )
  }
  return handler
}

function resolveLanguageID(raw: string): string {
  for (const languageID of Object.keys(languageFileExtensions)) {
    // @ts-ignore
    if (languageFileExtensions[languageID] === raw) return languageID
  }
  return "plaintext"
}

if (import.meta.vitest) {
  const {test, expect} = import.meta.vitest
  test("parse markdown and render", function () {
    const prefix = "# title\n\rnormal text\n\r```ts\n\r"
    const code = 'console.log("it works")\n\r'
    const suffix = "```\n\rnormal text\n\r"
    const raw = prefix + code + suffix
    expect(parseMarkdown(raw, "\n\r").length).toBe(1)

    const block = parseDocument(raw, "markdown", "\n\r")[0]
    expect(block.languageID).toBe("typescript")
    expect(block.start).toBe(prefix.length)
    expect(block.end).toBe(raw.length - suffix.length)
    expect(raw.slice(block.start, block.end)).toBe(code)

    expect(block.render(raw, "\n\r")).toBe(
      `${" ".repeat("# title".length)}\n\r` +
        `${" ".repeat("normal text".length)}\n\r` +
        `${" ".repeat("```ts".length)}\n\r` +
        'console.log("it works")\n\r' +
        `${" ".repeat("```".length)}\n\r` +
        `${" ".repeat("normal text".length)}\n\r`,
    )
  })
}
