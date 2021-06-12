const { electron } = require("playwright-electron");
const assert = require("assert");

const VSCODE =
  "/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron";

describe("flashcode command palette", function () {
  this.timeout(10000);

  beforeEach(async () => {
    // TODO: Install flashcode from source
    this.app = await electron.launch(VSCODE);
  });

  afterEach(async () => {
    await this.app.close();
  });

  it("should show flashcode commands", async () => {
    const page = await this.app.firstWindow();
    // TODO: Wait for vscode to finish loading
    await page.waitForTimeout(5000);

    await page.keyboard.press("Meta+Shift+P");
    await page.keyboard.type("Flashcode");
    const firstResult = await page.waitForSelector(
      "span.monaco-highlighted-label"
    );
    const firstCommand = await firstResult.innerText();
    assert(firstCommand === "FlashCode: Create New Deck");
  });
});
