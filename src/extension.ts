import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { registerPlayer } from "./comments";
import { store, WorkspaceDeck } from "./store";

export const EXTENSION_NAME = "flashcode";
const DECK_GLOB = "**/**.flash";

async function findDecks() {
  const files = await vscode.workspace.findFiles(DECK_GLOB);
  const hasDecks = files.length > 0;

  if (hasDecks) {
    store.decks = (
      await Promise.all(
        files.map(async (uri) => {
          const deckContent = await vscode.workspace.fs.readFile(uri);
          const deck = JSON.parse(deckContent.toString());
          return { uri, deck } as WorkspaceDeck;
        })
      )
    ).sort((a, b) => a.deck.title.localeCompare(b.deck.title));
  }

  vscode.commands.executeCommand(
    "setContext",
    `${EXTENSION_NAME}:hasDecks`,
    hasDecks
  );
}

export async function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  registerPlayer();

  await findDecks();

  const watcher = vscode.workspace.createFileSystemWatcher(DECK_GLOB);
  watcher.onDidChange(findDecks);
  watcher.onDidCreate(findDecks);
  watcher.onDidDelete(findDecks);
}
