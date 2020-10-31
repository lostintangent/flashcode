import {
  commands,
  env,
  ExtensionContext,
  QuickPickItem,
  Uri,
  window,
  workspace,
} from "vscode";
import { nextCard, startDeck, updateActiveDeck } from "./actions";
import { FlashCodeCardComment } from "./comments";
import { DECK_EXTENSION, EXTENSION_NAME } from "./extension";
import { store, WorkspaceDeck } from "./store";

export const NEW_CARD_TEMPLATE = "<question>\n---\n<answer>";

interface FlashcodedDeckItem extends QuickPickItem {
  deck: WorkspaceDeck;
}

async function selectDeck(action: string) {
  const items: FlashcodedDeckItem[] = store.workspaceDecks.map((deck) => ({
    deck,
    label: deck.deck.title,
    description: `${deck.deck.cards.length} cards`,
  }));

  const response = await window.showQuickPick(items, {
    placeHolder: `Select the deck you'd like to ${action}...`,
  });

  if (response) {
    return response.deck;
  }
}

export async function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.reviewDeck`, async () => {
      const selection = await selectDeck("review");
      if (selection) {
        commands.executeCommand("setContext", "flashcode:mode", "start");
        startDeck(selection.uri, selection.deck);
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.endDeck`, () =>
      window.activeTextEditor?.hide()
    )
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
          Decks: ["deck"],
        },
        defaultUri: workspace.workspaceFolders![0].uri,
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

        commands.executeCommand("setContext", "flashcode:mode", "start");
        startDeck(uri[0], deck);
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
        commands.executeCommand("setContext", "flashcode:mode", "start");
        startDeck(null, data);
      } catch {
        window.showErrorMessage(
          "This file doesn't appear to be a valid deck. Please inspect its contents and try again."
        );
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.newDeck`, async () => {
      const title = await window.showInputBox({
        prompt: "Specify the title of the deck",
      });

      if (!title) {
        return;
      }

      const defaultUri = Uri.joinPath(
        workspace.workspaceFolders![0].uri,
        `${title.toLowerCase().replace(/\s+/g, "-")}.${DECK_EXTENSION}`
      );
      const uri = await window.showSaveDialog({
        defaultUri,
        filters: {
          Decks: ["deck"],
        },
        saveLabel: "Save Deck",
      });

      if (!uri) {
        return;
      }

      const dateAdded = new Date().toJSON();

      const deck = {
        title,
        dateAdded,
        cards: [
          {
            body: NEW_CARD_TEMPLATE,
            dateAdded,
          },
        ],
      };

      const deckContent = new TextEncoder().encode(
        JSON.stringify(deck, null, 2)
      );
      await workspace.fs.writeFile(uri, deckContent);

      commands.executeCommand("setContext", "flashcode:mode", "add");
      startDeck(uri, deck, true);
    })
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.saveDeckAndFinish`,
    async (comment: FlashCodeCardComment) =>
      updateActiveDeck(comment.body as string, false, false, true)
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.saveDeckAndAddCard`,
    async (comment: FlashCodeCardComment) =>
      updateActiveDeck(comment.body as string, true, true)
  );

  commands.registerCommand(`${EXTENSION_NAME}.addDeckCard`, async () => {
    const selection = await selectDeck("add cards to");
    if (!selection) {
      return;
    }

    const { deck, uri } = selection;

    const newCard = {
      body: deck.cardTemplate || NEW_CARD_TEMPLATE,
      dateAdded: new Date().toJSON(),
    };

    deck.cards.push(newCard);
    const deckContent = new TextEncoder().encode(JSON.stringify(deck, null, 2));
    await workspace.fs.writeFile(uri, deckContent);

    commands.executeCommand("setContext", "flashcode:mode", "add");
    startDeck(uri, deck, true, deck.cards.length - 1);
  });

  commands.registerCommand(`${EXTENSION_NAME}.nextAnswer`, async () => {
    if (store.activeDeck!.showAnswer) {
      const isFinalCard =
        store.activeDeck!.seenCards.length ===
        store.activeDeck!.deck.cards.length - 1;

      if (isFinalCard) {
        commands.executeCommand(`${EXTENSION_NAME}.endDeck`);
      } else {
        commands.executeCommand(`${EXTENSION_NAME}.nextCard`);
      }
    } else {
      commands.executeCommand(`${EXTENSION_NAME}.showAnswer`);
    }
  });

  commands.registerCommand(`${EXTENSION_NAME}.deleteDeck`, async () => {
    const selection = await selectDeck("delete");

    if (selection) {
      await workspace.fs.delete(selection.uri);
    }
  });

  commands.registerCommand(
    `${EXTENSION_NAME}.editCard`,
    async (comment: FlashCodeCardComment) => {
      store.activeDeck!.editMode = true;
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.saveDeckAndContinue`,
    async (comment: FlashCodeCardComment) => {
      updateActiveDeck(comment.body as string, false, true);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.saveDeck`,
    async (comment: FlashCodeCardComment) => {
      updateActiveDeck(comment.body as string, false, false);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.cancelEdit`,
    async (comment: FlashCodeCardComment) => {
      store.activeDeck!.editMode = false;
    }
  );
}
