import { reaction } from "mobx";
import {
  commands,
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

export class FlashCodeCardComment implements Comment {
  body: MarkdownString | string;
  mode: CommentMode;
  author: CommentAuthorInformation;
  contextValue?: string | undefined;
  reactions?: CommentReaction[] | undefined;
  label?: string | undefined;

  constructor(
    deckTitle: string,
    cardNumber: number,
    seenCards: number,
    totalCards: number,
    card: MarkdownString,
    editMode: boolean
  ) {
    this.label = `${deckTitle} (${seenCards} of ${totalCards})`;
    this.body = card;
    this.mode = editMode ? CommentMode.Editing : CommentMode.Preview;
    this.author = {
      name: "FlashCode",
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
  provider = comments.createCommentController(EXTENSION_NAME, "FlashCode");

  const isFinalCard =
    store.activeDeck!.seenCards.length ===
    store.activeDeck!.deck.cards.length - 1;

  const cardContent = store.activeDeck!.deck.cards[card].body;

  let cardBody: MarkdownString;
  if (store.activeDeck?.editMode) {
    cardBody = new MarkdownString(cardContent);
  } else {
    if (cardContent.includes("{{")) {
      const replaceValue = store.activeDeck?.showAnswer
        ? "**[$1]**"
        : "**[...]**";
      const replacedCard = cardContent.replace(/{{([^}]+)}}/gm, replaceValue);
      const footer = store.activeDeck?.showAnswer
        ? isFinalCard
          ? `[Finish Deck](command:${EXTENSION_NAME}.endDeck "End deck")`
          : `[Next Card](command:${EXTENSION_NAME}.nextCard "Next card")`
        : `[Show Answer](command:${EXTENSION_NAME}.showAnswer "Show answer")`;

      cardBody = new MarkdownString(
        `
${replacedCard}
\n---\n
${footer}`,
        true
      );
    } else if (cardContent.includes("---")) {
      const [cardQuestion, cardAnswer] = cardContent.split("---");
      cardBody = new MarkdownString(
        store.activeDeck?.showAnswer
          ? "**Question:** " +
            cardQuestion +
            "\n" +
            "**Answer:** " +
            cardAnswer +
            "\n---\n" +
            (isFinalCard
              ? `[Finish Deck](command:${EXTENSION_NAME}.endDeck "End deck")`
              : `[Next Card](command:${EXTENSION_NAME}.nextCard "Next card")`)
          : `**Question:** ${cardQuestion}
---
⬇️ [Show Answer](command:${EXTENSION_NAME}.showAnswer "Show answer")`
      );
    } else {
      cardBody = new MarkdownString(
        `**Fact:** ${cardContent}\n\n---\n` +
          (isFinalCard
            ? `[Finish Deck](command:${EXTENSION_NAME}.endDeck "End deck")`
            : `[Next Card](command:${EXTENSION_NAME}.nextCard "Next card")`)
      );
    }

    cardBody.isTrusted = true;
  }

  const comment = new FlashCodeCardComment(
    deckTitle,
    card + 1,
    store.activeDeck!.seenCards.length + 1,
    store.activeDeck!.deck.cards.length,
    cardBody,
    store.activeDeck!.editMode
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
    () => (store.activeDeck ? store.activeDeck.editMode : false),
    (editMode) => {
      commands.executeCommand("setContext", "flashcode:isEditing", editMode);
    }
  );

  reaction(
    () =>
      store.activeDeck
        ? [
            store.activeDeck.deck.title,
            store.activeDeck.card,
            store.activeDeck.showAnswer,
            store.activeDeck.editMode,
          ]
        : null,
    () => {
      if (store.activeDeck) {
        showCard(store.activeDeck.card);
      }
    }
  );
}
