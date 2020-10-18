import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { registerPlayer } from "./comments";
import { initializeDeckProvider } from "./provider";

export const EXTENSION_NAME = "flashcode";
export const DECK_EXTENSION = "deck";

export async function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  registerPlayer();

  initializeDeckProvider();
}
