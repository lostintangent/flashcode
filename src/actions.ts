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
  addCardAndContinue: boolean = false
) {
  store.activeDeck!.deck!.cards[store.activeDeck!.card] = cardContent;
  if (addCardAndContinue) {
    const newCard = store.activeDeck!.deck.cardTemplate || NEW_CARD_TEMPLATE;
    store.activeDeck?.deck.cards.push(newCard);
  }

  if (addCardAndContinue) {
    store.activeDeck!.card = store.activeDeck!.deck.cards.length - 1;
  } else {
    window.activeTextEditor?.hide();
  }

  const deckContent = new TextEncoder().encode(
    JSON.stringify(store.activeDeck!.deck!, null, 2)
  );
  await workspace.fs.writeFile(store.activeDeck!.uri!, deckContent);
}
