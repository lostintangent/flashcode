# FlashCode 📇

FlashCode is a VS Code extension that allows you to create and review decks of flash cards, directly within your editor. This makes it easier to maintain and retain your individual knowledge, and incorporates the act of learning more naturally into your daily workflow.

Behind the scenes, decks are simply JSON files, which can be stored and shared with anyone. For example, you can keep your individual decks in a GitHub Gist, and your team-shared decks in a team repo. FlashCode allows you to open decks by file and/or URL, which makes it easy to manage them however you'd like.

<img width="800px" src="https://user-images.githubusercontent.com/116461/96603145-98112c00-12a8-11eb-97ab-008a31a3215b.gif" />

## Getting Started

In order to start creating and reviewing your own flash card decks, simply perform the following steps:

1. Install this extension and then reload VS Code

1. Run the `FlashCode: Create New Deck` command, and then specify the name and location of the new deck.

1. Populate the card contents with a question/answer, cloze statement or fact. You can use full markdown in your content (e.g. code blocks, bold, images, etc.) in order to make your cards as rich as neeeded. View [card types](#card-types) for more details.

   <!--prettier-ignore-->
   <img width="500px" src="https://user-images.githubusercontent.com/116461/97789643-6a1cc900-1b7f-11eb-8b0c-519350302e7e.png" />

1. Add as many cards as you want by clicking the `Save and add new card` button. Once you're finished, click the `Save and close deck` button.

1. When you want to review your deck, simply run the `FlashCode: Review Deck` or `FlashCode: Open Deck File...` and select the desired deck.

FlashCode will randomly walk you through each card in the deck, showing you the question first, and then waiting for you to choose to see the answer.

<img width="500px" src="https://user-images.githubusercontent.com/116461/97789896-69853200-1b81-11eb-8cfa-81994784f643.png" />

Once you've reviewed every, you can finish the deck. At any time, if you'd like to edit the contents of a card, you can click the pencil icon in the header bar of the current card.

Later, when you want to add new cards to an existing deck, simply run the `FlashCode: Add Card(s) to Deck...` command, and select the desired deck.

## Card Types

When you create/edit a deck, your cards can take one of three forms, each of which can be authored using Markdown (e.g. include images, list, code blocks, etc.):

### Question/answer

This is the default card type, and is simply comprised of a question/answer pair, delimited by a `---`. When this card type is displayed during review, the question will be initially displayed, and you can progressively reveal the answer.

<!--prettier-ignore-->
| State | Example |
|-|-|
| Editing | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789643-6a1cc900-1b7f-11eb-8b0c-519350302e7e.png" /> |
| Question | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789896-69853200-1b81-11eb-8cfa-81994784f643.png" /> |
| Answer | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789898-6ab65f00-1b81-11eb-82ec-a1b7e0d60941.png" /> |

### Cloze placeholders

A "cloze" card allows you to define a fact statement, which include one or more placeholders enclosed in `{{` (e.g. `This is an {{example}}`). When these cards are displayed during review, the fact will be presented, and the placeholders will be replaced with `[...]`. Once you choose to show the answer, the fact will be displayed as-is, with the placeholders revealed.

<!--prettier-ignore-->
| State | Example |
|-|-|
| Editing | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789640-61c48e00-1b7f-11eb-981c-6adef476c563.png" /> |
| Question | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789978-0cd64700-1b82-11eb-9189-1884e41a4d2c.png" /> |
| Answer | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789979-0f38a100-1b82-11eb-8e0d-94f5dc47856a.png" /> |

### Fact-only

A fact-only card simply defines a fact (via markdown conent) that you'd like to review as part of the deck. It doesn't include any answer sides or cloze placeholders, and therefore, when you encounter it in a deck, you'll simply see the fact, and then be able to navigate to the next card.

<!--prettier-ignore-->
| State | Example |
|-|-|
| Editing | <img width="500px" src="https://user-images.githubusercontent.com/116461/97789693-b6680900-1b7f-11eb-8be9-793743c07a81.png" /> |
| Reviewing | <img width="500px" src="https://user-images.githubusercontent.com/116461/97790006-4dce5b80-1b82-11eb-9320-14cd0806d18e.png"> |

## Contributed Commands

When you install the `FlashCode` extension, the following commands are contributed to the command palette, and can be used to manage your flash card decks:

- `FlashCode: Create New Deck` - Creates a new flash card deck, with a specific name and file location.

- `FlashCode: Review Deck` - Allows you to review a deck by selecting one from your currently opened workspace.

- `FlashCode: Add Card(s) to Deck...` - Adds one or more cards to an existing deck in your currently opened workspace.

- `FlashCode: Open Deck URL...` - Allows you to review a deck by specifying a URL location.

- `FlashCode: Open Deck File...` - Allows you to review a deck by selecting the file on disk.

- `FlashCode: Delete Deck` - Allows you to delete one of the flash card decks in your currently opened workspace.
