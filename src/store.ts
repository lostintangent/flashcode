import { observable } from "mobx";

export interface ActiveDeck {
  deck: Deck;
  card: number;
  showAnswer: boolean;
  seenCards: number[];
}

export interface Deck {
  title: string;
  cards: string[];
}

export interface Store {
  activeDeck: ActiveDeck | undefined;
  decks: Deck[];
}

export const store: Store = observable({
  activeDeck: undefined,
  decks: [],
});
