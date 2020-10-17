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

export function registerTextDocumentContentProvider() {}

const ICON_URL =
  "https://user-images.githubusercontent.com/116461/96352964-b72b7600-107c-11eb-9e8a-a2afc72e936f.png";

class FlashcodeCardComment implements Comment {
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
  const cardUri = Uri.parse(`${EXTENSION_NAME}:/${deckTitle}`);
  provider = comments.createCommentController(EXTENSION_NAME, "Flashcode");

  const cardContent = store.activeDeck!.deck.cards[card];
  const [cardQuestion, cardAnswer] = cardContent.split("---");

  const isFinalCard =
    store.activeDeck!.seenCards.length ===
    store.activeDeck!.deck.cards.length - 1;

  const cardBody = new MarkdownString(
    store.activeDeck?.showAnswer
      ? "❓ **Question:** " +
        cardQuestion +
        "\n" +
        "💡 **Answer:** " +
        cardAnswer +
        "\n---\n" +
        (isFinalCard
          ? `[Finish Deck](command:${EXTENSION_NAME}.endDeck)`
          : `➡ [Next Card](command:${EXTENSION_NAME}.nextCard)`)
      : `❓ **Question:** ${cardQuestion}
---
⬇️ [Show Answer](command:${EXTENSION_NAME}.showAnswer)`
  );
  cardBody.isTrusted = true;

  const comment = new FlashcodeCardComment(
    deckTitle,
    card + 1,
    store.activeDeck!.deck.cards.length,
    cardBody
  );
  const thread = provider.createCommentThread(cardUri, new Range(0, 0, 0, 0), [
    comment,
  ]);

  // @ts-ignore
  thread.canReply = false;

  thread.collapsibleState = CommentThreadCollapsibleState.Expanded;
  window.showTextDocument(cardUri);
}

export function registerPlayer() {
  workspace.registerTextDocumentContentProvider(EXTENSION_NAME, {
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
