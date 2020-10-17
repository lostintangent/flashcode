import {
  commands,
  env,
  ExtensionContext,
  QuickPickItem,
  window,
  workspace,
} from "vscode";
import { nextCard, startDeck } from "./actions";
import { EXTENSION_NAME } from "./extension";
import { Deck, store } from "./store";

interface FlashcodedDeckItem extends QuickPickItem {
  deck: Deck;
}

export async function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.startDeck`, async () => {
      const items: FlashcodedDeckItem[] = store.decks.map((deck) => ({
        deck,
        label: deck.title,
      }));

      const response = await window.showQuickPick(items, {
        placeHolder: "Select the deck you'd like to start",
      });

      if (response) {
        startDeck(response.deck);
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.endDeck`, async () => {
      window.activeTextEditor?.hide();
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.showAnswer`, async () => {
      store.activeDeck!.showAnswer = true;
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.nextCard`, nextCard)
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.openDeckFile`, async () => {
      const uri = await window.showOpenDialog({
        filters: {
          Tours: ["flash"],
        },
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Open Deck",
      });

      if (!uri) {
        return;
      }

      try {
        const bytes = await workspace.fs.readFile(uri[0]);
        const contents = new TextDecoder().decode(bytes);
        const deck = JSON.parse(contents);

        startDeck(deck);
      } catch {
        window.showErrorMessage(
          "This file doesn't appear to be a valid deck. Please inspect its contents and try again."
        );
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.openDeckUrl`, async () => {
      const url = await window.showInputBox({
        prompt: "Specify the URL of the deck file to open",
        value: await env.clipboard.readText(),
      });

      if (!url) {
        return;
      }

      try {
        const axios = require("axios").default;
        const { data } = await axios.get(url);
        startDeck(data);
      } catch {
        window.showErrorMessage(
          "This file doesn't appear to be a valid deck. Please inspect its contents and try again."
        );
      }
    })
  );
}
