import { Uri, window, workspace } from "vscode";
import { NEW_CARD_TEMPLATE } from "./commands";
import { Deck, store } from "./store";

function randomNumber(upperBound: number) {
  return Math.floor(Math.random() * (upperBound + 1));
}

export function nextCard() {
  store.activeDeck!.showAnswer = false;
  store.activeDeck!.seenCards.push(store.activeDeck!.card);

  let newCard = randomNumber(store.activeDeck!.deck.cards.length - 1);
  while (store.activeDeck!.seenCards.includes(newCard)) {
    newCard = randomNumber(store.activeDeck!.deck.cards.length - 1);
  }

  store.activeDeck!.card = newCard;
}

export function startDeck(
  uri: Uri | null,
  deck: Deck,
  editMode: boolean = false,
  card?: number
) {
  store.activeDeck = {
    uri,
    showAnswer: false,
    seenCards: [],
    deck,
    card: card || (editMode ? 0 : randomNumber(deck.cards.length - 1)),
    editMode,
  };
}

export async function updateActiveDeck(
  cardContent: string,
  addCard: boolean = false,
  continueDeck: boolean = false,
  closeDeck: boolean = false
) {
  store.activeDeck!.deck!.cards[store.activeDeck!.card] = cardContent;

  if (addCard) {
    const newCard = store.activeDeck!.deck.cardTemplate || NEW_CARD_TEMPLATE;
    store.activeDeck?.deck.cards.push(newCard);
  } else {
    store.activeDeck!.editMode = false;
  }

  const deckContent = new TextEncoder().encode(
    JSON.stringify(store.activeDeck!.deck!, null, 2)
  );
  workspace.fs.writeFile(store.activeDeck!.uri!, deckContent);

  if (continueDeck) {
    if (addCard) {
      store.activeDeck!.card = store.activeDeck!.deck.cards.length - 1;
    } else {
      nextCard();
    }
  } else if (closeDeck) {
    window.activeTextEditor?.hide();
  }
}
