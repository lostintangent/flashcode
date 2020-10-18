import { observable } from "mobx";
import { Uri } from "vscode";

export interface ActiveDeck {
  uri: Uri | null;
  deck: Deck;
  card: number;
  showAnswer: boolean;
  seenCards: number[];
  editMode: boolean;
}

export interface WorkspaceDeck {
  uri: Uri;
  deck: Deck;
}

export interface Deck {
  title: string;
  cards: string[];
  cardTemplate?: string;
}

export interface Store {
  activeDeck: ActiveDeck | undefined;
  decks: WorkspaceDeck[];
}

export const store: Store = observable({
  activeDeck: undefined,
  decks: [],
});
