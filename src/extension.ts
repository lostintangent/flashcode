import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { registerPlayer } from "./comments";
import { store, WorkspaceDeck } from "./store";

export const EXTENSION_NAME = "flashcode";
export async function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  registerPlayer();

  const files = await vscode.workspace.findFiles("**/**.flash");
  if (files.length > 0) {
    store.decks = (
      await Promise.all(
        files.map(async (uri) => {
          const deckContent = await vscode.workspace.fs.readFile(uri);
          const deck = JSON.parse(deckContent.toString());
          return { uri, deck } as WorkspaceDeck;
        })
      )
    ).sort((a, b) => a.deck.title.localeCompare(b.deck.title));

    vscode.commands.executeCommand(
      "setContext",
      `${EXTENSION_NAME}:hasDecks`,
      true
    );
  }
}
