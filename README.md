# FlashCode 📇

FlashCode is a VS Code extension that allows you to create and review decks of flash cards, directly within your editor. This makes it easier to maintain and retain your individual knowledge, and incorporates the act of learning more naturally into your daily workflow.

Behind the scenes, decks are simply JSON files, which can be stored and shared with anyone. For example, you can keep your individual decks in a GitHub Gist, and your team-shared decks in a team repo. FlashCode allows you to open decks by file and/or URL, which makes it easy to manage them however you'd like.

<img width="800px" src="https://user-images.githubusercontent.com/116461/96603145-98112c00-12a8-11eb-97ab-008a31a3215b.gif" />

## Card Types

When you create/edit a deck, your cards can take one of three forms, each of which can be authored using Markdown (e.g. include images, list, code blocks, etc.):

- <ins>Question/answer</ins> - This is the default card type, and is simply comprised of a question/answer pair, delimited by a `---`. When this card type is displayed during review, the question will be initially displayed, and you can progressively reveal the answer.

- <ins>Cloze placeholders</ins> - A "cloze" card allows you to define a fact statement, which include one or more placeholders enclosed in `{{` (e.g. `This is an {{example}}`). When these cards are displayed during review, the fact will be presented, and the placeholders will be replaced with `[...]`. Once you choose to show the answer, the fact will be displayed as-is, with the placeholders revealed.

- <ins>Fact-only</ins> - A fact-only card simply defines a fact (via markdown conent) that you'd like to review as part of the deck. It doesn't include any answer sides or cloze placeholders, and therefore, when you encounter it in a deck, you'll simply see the fact, and then be able to navigate to the next card.

## Contributed Commands

When you install the `FlashCode` extension, the following commands are contributed to the command palette, and can be used to manage your flash card decks:

- `FlashCode: Create New Deck` - Creates a new flash card deck, with a specific name and file location.

- `FlashCode: Review Deck` - Allows you to review a deck by selecting one from your currently opened workspace.

- `FlashCode: Add Card(s) to Deck...` - Adds one or more cards to an existing deck in your currently opened workspace.

- `FlashCode: Open Deck URL...` - Allows you to review a deck by specifying a URL location.

- `FlashCode: Open Deck File...` - Allows you to review a deck by selecting the file on disk.

- `FlashCode: Delete Deck` - Allows you to delete one of the flash card decks in your currently opened workspace.
