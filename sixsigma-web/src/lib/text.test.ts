import { describe, expect, it } from "vitest";
import { cleanHtml, cleanText, firstSentences, stripTags, truncate } from "./text";

describe("cleanText", () => {
  it("repairs double-encoded UTF-8 from the legacy CMS", () => {
    expect(cleanText("Weâ€™ll help")).toBe("We’ll help");
    expect(cleanText("9 am â€“ 5 pm")).toBe("9 am – 5 pm");
  });

  it("repairs characters lost to U+FFFD", () => {
    expect(cleanText("ArchiMate� 3")).toBe("ArchiMate® 3");
    expect(cleanText("We�ll")).toBe("We’ll");
    expect(cleanText("Training � a company")).toBe("Training – a company");
  });

  it("leaves correct accented text alone", () => {
    expect(cleanText("café résumé")).toBe("café résumé");
  });

  it("collapses whitespace", () => {
    expect(cleanText("  a \n\t b  ")).toBe("a b");
  });
});

describe("cleanHtml", () => {
  it("makes links to the live site relative", () => {
    expect(cleanHtml('<a href="https://www.sixsigma.co.uk/courses">x</a>')).toBe('<a href="/courses">x</a>');
  });
});

describe("stripTags / truncate / firstSentences", () => {
  it("strips markup and decodes common entities", () => {
    expect(stripTags("<p>Fish &amp; chips</p><li>One</li>")).toBe("Fish & chips One");
  });

  it("truncates on a word boundary with an ellipsis", () => {
    expect(truncate("The quick brown fox jumps", 12)).toBe("The quick…");
    expect(truncate("Short", 12)).toBe("Short");
  });

  it("keeps whole sentences within the limit", () => {
    expect(firstSentences("One. Two. Three is longer.", 10)).toBe("One. Two.");
  });
});
