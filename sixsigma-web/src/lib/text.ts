import { BASE_PATH, legacyUrl } from "./site";

// Cleans text migrated from the legacy CMS, which mixes double-encoded UTF-8
// ("â€™" for "’") with bytes lost to U+FFFD.

const CP1252: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88, "‰": 0x89,
  "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95,
  "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b, "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
};

const toByte = (ch: string) => CP1252[ch] ?? ch.charCodeAt(0);

// A UTF-8 lead byte rendered as cp1252, followed by 1–3 continuation bytes.
const MOJIBAKE = /[Â-ô][\u0080-¿€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]{1,3}/g;

function repairMojibake(s: string) {
  return s.replace(MOJIBAKE, (m) => {
    const bytes = Uint8Array.from([...m].map(toByte));
    if (bytes.some((b) => b > 0xff)) return m;
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return decoded.includes("�") ? m : decoded;
  });
}

function repairReplacementChars(s: string) {
  return s
    .replace(/ArchiMate�/g, "ArchiMate®")
    .replace(/�\s*Copyright/g, "© Copyright")
    .replace(/(\w)�(\w)/g, "$1’$2")
    .replace(/\s�\s/g, " – ")
    .replace(/�(?=[\w<])/g, "“")
    .replace(/(?<=[\w.,>])�/g, "”")
    .replace(/�/g, "");
}

export function cleanText(s: string | null | undefined): string {
  if (!s) return "";
  return repairReplacementChars(repairMojibake(s)).replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

export function cleanHtml(s: string | null | undefined): string {
  if (!s) return "";
  return repairReplacementChars(repairMojibake(s))
    .replace(/ /g, " ")
    .replace(/https?:\/\/(www\.)?sixsigma\.co\.uk(?=\/)/g, "")
    .replace(/(href|src)="\/(uploads|booking)\//g, (_, attr: string, dir: string) => `${attr}="${legacyUrl(`/${dir}/`)}`)
    .replace(/(href|src)="\/(?!\/)/g, `$1="${BASE_PATH}/`)
    .trim();
}

export function stripTags(html: string): string {
  return cleanText(
    html
      .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;|&rsquo;/g, "’")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">"),
  );
}

export function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export const firstSentences = (s: string, max = 220) => {
  const sentences = s.match(/[^.!?]+[.!?]+/g) ?? [s];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).length > max) break;
    out += sentence;
  }
  return (out || truncate(s, max)).trim();
};
