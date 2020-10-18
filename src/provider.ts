import * as vscode from "vscode";
import { EXTENSION_NAME } from "./extension";
import { store, WorkspaceDeck } from "./store";

const DECK_GLOB = `**/*.deck`;

async function discoverDecks() {
  console.log("FlashCode: Discovering decks ", DECK_GLOB);
  const files = await vscode.workspace.findFiles(DECK_GLOB);
  const hasDecks = files.length > 0;

  console.log("FlashCode: Found decks ", files);

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

export async function initializeDeckProvider() {
  await discoverDecks();

  const watcher = vscode.workspace.createFileSystemWatcher(DECK_GLOB);
  watcher.onDidChange(discoverDecks);
  watcher.onDidCreate(discoverDecks);
  watcher.onDidDelete(discoverDecks);
}
