import { reaction } from "mobx";
import {
  Comment,
  CommentAuthorInformation,
  CommentController,
  CommentMode,
  CommentReaction,
  comments,
  CommentThreadCollapsibleState,
  MarkdownString,
  Range,
  Uri,
  window,
  workspace,
} from "vscode";
import { EXTENSION_NAME } from "./extension";
import { store } from "./store";
export const CARD_SCHEME = "codecard";

export function registerTextDocumentContentProvider() {}

const ICON_URL =
  "https://cdn.jsdelivr.net/gh/codespaces-contrib/flashcode/icon.png";

class CodeCardComment implements Comment {
  body: MarkdownString;
  mode: CommentMode;
  author: CommentAuthorInformation;
  contextValue?: string | undefined;
  reactions?: CommentReaction[] | undefined;
  label?: string | undefined;

  constructor(
    deckTitle: string,
    cardNumber: number,
    totalCards: number,
    card: MarkdownString
  ) {
    this.label = `${deckTitle} (${cardNumber} of ${totalCards})`;
    this.body = card;
    this.mode = CommentMode.Preview;
    this.author = {
      name: "Flashcode",
      iconPath: Uri.parse(ICON_URL),
    };
  }
}

let provider: CommentController;
function showCard(card: number) {
  if (provider) {
    provider.dispose();
  }

  const deckTitle = store.activeDeck!.deck.title;
  const cardUri = Uri.parse(`${CARD_SCHEME}:/${deckTitle}`);
  provider = comments.createCommentController(EXTENSION_NAME, "Flashcode");

  const cardContent = store.activeDeck!.deck.cards[card];
  const [cardQuestion, cardAnswer] = cardContent.split("---");

  const isFinalCard =
    store.activeDeck!.seenCards.length ===
    store.activeDeck!.deck.cards.length - 1;
  const cardBody = new MarkdownString(
    store.activeDeck?.showAnswer
      ? cardContent +
        "\n\n" +
        (isFinalCard
          ? "[Finish Deck](command:codecards.endDeck)"
          : "[Next Card](command:codecards.nextCard)")
      : cardQuestion + "\n\n[Show Answer](command:codecards.showAnswer)"
  );
  cardBody.isTrusted = true;

  const comment = new CodeCardComment(
    deckTitle,
    card + 1,
    store.activeDeck!.deck.cards.length,
    cardBody
  );
  const thread = provider.createCommentThread(cardUri, new Range(0, 0, 0, 0), [
    comment,
  ]);

  thread.collapsibleState = CommentThreadCollapsibleState.Expanded;
  window.showTextDocument(cardUri);
}

export function registerPlayer() {
  workspace.registerTextDocumentContentProvider(CARD_SCHEME, {
    provideTextDocumentContent: () => "",
  });

  reaction(
    () =>
      store.activeDeck
        ? [
            store.activeDeck.deck.title,
            store.activeDeck.card,
            store.activeDeck.showAnswer,
          ]
        : null,
    () => {
      if (store.activeDeck) {
        showCard(store.activeDeck.card);
      }
    }
  );
}
