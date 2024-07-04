import {basename, dirname, extname} from "path"
import {
  CompletionList,
  EndOfLine,
  ExtensionContext,
  TextDocumentContentProvider,
  commands,
  workspace,
} from "vscode"
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node"
import {parseDocument, resolveExt} from "./language"

let client: LanguageClient | null = null

/**
 * Handle code blocks as virtual document contents
 * in order to call corresponding language services.
 * One document might contain more than one code blocks,
 * so the value type is an array of string.
 *
 * - key: Url of the source file.
 * - value: All doc code blocks contained by current source file.
 */
const vDocHandler = new Map<string, string[]>()

const vDocProvider: TextDocumentContentProvider = {
  provideTextDocumentContent(uri) {
    const raw = uri.toString(true)
    const index = parseInt(
      basename(raw)
        .slice("code-".length)
        .replace(new RegExp(`.${extname(raw)}`), ""),
      16,
    )
    return vDocHandler.get(dirname(raw))?.at(index) ?? ""
  },
}

const serverOpts: ServerOptions = {command: "", transport: TransportKind.ipc}

const clientOpts: LanguageClientOptions = {
  documentSelector: [{scheme: "file", language: "markdown"}],
  middleware: {
    async provideCompletionItem(document, position, context, token, next) {
      const content = document.getText()
      const lang = document.languageId
      const blocks = parseDocument(content, lang, getEol(document.eol))
      if (blocks.length === 0) return next(document, position, context, token)

      const index = position.character
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        if (index >= block.start && index <= block.end) {
          const url = document.uri.toString(true)
          const contents = blocks.map((block) => block.of(content))
          vDocHandler.set(url, contents)

          return await commands.executeCommand<CompletionList>(
            "vscode.executeCompletionItemProvider",
            `code-in-doc:${url}/code-${i.toString(16)}.${resolveExt(lang)}`,
            position,
            context.triggerCharacter,
            token,
          )
        }
      }
      // Current position is not inside any code block.
      return next(document, position, context, token)
    },
  },
}

function getEol(raw: EndOfLine): string {
  if (raw == EndOfLine.LF) return "\n"
  if (raw == EndOfLine.CRLF) return "\r\n"
  throw new Error("Unknown EndOfLine")
}

export function activate(_context: ExtensionContext) {
  workspace.registerTextDocumentContentProvider("code-in-doc", vDocProvider)
  client = new LanguageClient("code-in-doc", serverOpts, clientOpts)
  client?.start()
}

export function deactivate() {
  client?.stop()
}
