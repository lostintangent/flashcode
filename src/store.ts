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

export interface Deck {
  title: string;
  cards: string[];
  cardTemplate?: string;
}

export interface WorkspaceDeck {
  uri: Uri;
  deck: Deck;
}

export interface Store {
  activeDeck: ActiveDeck | undefined;
  workspaceDecks: WorkspaceDeck[];
}

export const store: Store = observable({
  activeDeck: undefined,
  workspaceDecks: [],
});
