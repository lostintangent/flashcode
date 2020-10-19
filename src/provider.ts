import * as vscode from "vscode";
import { EXTENSION_NAME } from "./extension";
import { store, WorkspaceDeck } from "./store";

const DECK_GLOB = `**/*.deck`;

async function discoverDecks() {
  const files = await vscode.workspace.findFiles(DECK_GLOB);
  const hasDecks = files.length > 0;

  if (hasDecks) {
    store.workspaceDecks = (
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

export async function initializeDeckProvider() {
  await discoverDecks();

  const watcher = vscode.workspace.createFileSystemWatcher(DECK_GLOB);
  watcher.onDidChange(discoverDecks);
  watcher.onDidCreate(discoverDecks);
  watcher.onDidDelete(discoverDecks);
}
