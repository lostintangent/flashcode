import {
  commands,
  env,
  ExtensionContext,
  QuickPickItem,
  Uri,
  window,
  workspace,
} from "vscode";
import { nextCard, startDeck } from "./actions";
import { FlashcodeCardComment } from "./comments";
import { EXTENSION_NAME } from "./extension";
import { store, WorkspaceDeck } from "./store";

interface FlashcodedDeckItem extends QuickPickItem {
  deck: WorkspaceDeck;
}

const NEW_CARD_TEMPLATE = "<question>\n---\n<answer>";

export async function registerCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`${EXTENSION_NAME}.startDeck`, async () => {
      const items: FlashcodedDeckItem[] = store.decks.map((deck) => ({
        deck,
        label: deck.deck.title,
      }));

      const response = await window.showQuickPick(items, {
        placeHolder: "Select the deck you'd like to start...",
      });

      if (response) {
        startDeck(response.deck.uri, response.deck.deck);
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
        `${title.toLowerCase().replace(/\s+/g, "-")}.flash`
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

      const deck = {
        title,
        cards: [NEW_CARD_TEMPLATE],
      };

      const deckContent = new TextEncoder().encode(
        JSON.stringify(deck, null, 2)
      );
      await workspace.fs.writeFile(uri, deckContent);
      startDeck(uri, deck, true);
    })
  );

  async function updateActiveDeck(
    cardContent: string,
    addCardAndContinue: boolean = false
  ) {
    store.activeDeck!.deck!.cards[store.activeDeck!.card] = cardContent;

    if (addCardAndContinue) {
      store.activeDeck?.deck.cards.push(NEW_CARD_TEMPLATE);
    }

    const deckContent = new TextEncoder().encode(
      JSON.stringify(store.activeDeck!.deck!, null, 2)
    );
    await workspace.fs.writeFile(store.activeDeck!.uri!, deckContent);

    if (addCardAndContinue) {
      store.activeDeck!.card = store.activeDeck!.deck.cards.length - 1;
    } else {
      window.activeTextEditor?.hide();
    }
  }

  commands.registerCommand(
    `${EXTENSION_NAME}.saveDeckAndFinish`,
    async (comment: FlashcodeCardComment) =>
      updateActiveDeck(comment.body as string)
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.saveDeckAndAddCard`,
    async (comment: FlashcodeCardComment) =>
      updateActiveDeck(comment.body as string, true)
  );

  commands.registerCommand(`${EXTENSION_NAME}.addDeckCard`, async () => {
    const items: FlashcodedDeckItem[] = store.decks.map((deck) => ({
      deck,
      label: deck.deck.title,
    }));

    const response = await window.showQuickPick(items, {
      placeHolder: "Select the deck you'd like to add a card to...",
    });

    if (!response) {
      return;
    }

    const {
      deck: { deck, uri },
    } = response;
    deck.cards.push(NEW_CARD_TEMPLATE);
    const deckContent = new TextEncoder().encode(JSON.stringify(deck, null, 2));
    await workspace.fs.writeFile(uri, deckContent);

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
    const items: FlashcodedDeckItem[] = store.decks.map((deck) => ({
      deck,
      label: deck.deck.title,
    }));

    const response = await window.showQuickPick(items, {
      placeHolder: "Select the deck you'd like to delete...",
    });

    if (!response) {
      return;
    }

    await workspace.fs.delete(response.deck.uri);
  });
}
