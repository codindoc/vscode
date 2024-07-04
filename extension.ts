import {ExtensionContext, workspace} from "vscode"
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node"

let client: LanguageClient | null = null

const vDocHandler = new Map<string, string>()

export function activate(_context: ExtensionContext) {
  workspace.registerTextDocumentContentProvider("code-in-doc", {
    provideTextDocumentContent: (uri) => vDocHandler.get(uri.toString(true)),
  })

  const serverOpts: ServerOptions = {command: "", transport: TransportKind.ipc}
  const clientOpts: LanguageClientOptions = {
    documentSelector: [{scheme: "file", language: "markdown"}],
    middleware: {
      async provideCompletionItem(document, position, context, token, next) {
        return next(document, position, context, token)
      },
    },
  }

  client = new LanguageClient("code-in-doc", serverOpts, clientOpts)
  client?.start()
}

export function deactivate() {
  client?.stop()
}
