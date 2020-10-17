import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { registerPlayer } from "./comments";
import { store } from "./store";

export const EXTENSION_NAME = "flashcode";
export async function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  registerPlayer();

  if (vscode.workspace.workspaceFolders) {
    const uri = vscode.workspace.workspaceFolders[0].uri.with({
      path: `${vscode.workspace.workspaceFolders[0].uri.path}/.main.flash`,
    });

    let deck;
    try {
      const deckContent = await vscode.workspace.fs.readFile(uri);
      deck = JSON.parse(deckContent.toString());

      store.decks = [deck];
      vscode.commands.executeCommand(
        "setContext",
        `${EXTENSION_NAME}:hasDecks`,
        true
      );
    } catch (e) {
      // Deck file is likely invalid JSON content
      // and so we should just no-op.
    }
  }
}
