import { Deck, store } from "./store";

function randomNumber(upperBound: number) {
  return Math.floor(Math.random() * (upperBound + 1))
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

export function startDeck(deck: Deck) {
  store.activeDeck = {
    showAnswer: false,
    seenCards: [],
    deck,
    card: randomNumber(deck.cards.length - 1),
  };
}
