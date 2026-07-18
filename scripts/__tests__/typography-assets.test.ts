// @vitest-environment node

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { create } from "fontkitten";
import { describe, expect, test } from "vitest";

const projectRoot = fileURLToPath(new URL("../..", import.meta.url));
const fontDirectory = path.join(
  projectRoot,
  "src/assets/fonts/ibm-plex-mono",
);
const regularPath = path.join(fontDirectory, "IBMPlexMono-Regular.woff2");
const mediumPath = path.join(fontDirectory, "IBMPlexMono-Medium.woff2");

const readProjectFile = (relativePath: string) =>
  readFile(path.join(projectRoot, relativePath), "utf8");

const loadFont = async (fontPath: string) => {
  const font = create(await readFile(fontPath));
  if (font.isCollection) {
    throw new Error(`Expected a single font file: ${fontPath}`);
  }
  return font;
};

describe("self-hosted terminal font assets", () => {
  test("contains only the selected WOFF2 pair and required records", async () => {
    expect((await readdir(fontDirectory)).sort()).toEqual([
      "IBMPlexMono-Medium.woff2",
      "IBMPlexMono-Regular.woff2",
      "OFL.txt",
      "README.md",
    ]);

    const sizes = await Promise.all(
      [regularPath, mediumPath].map(async (fontPath) => (await stat(fontPath)).size),
    );
    expect(sizes).toEqual([49_248, 50_400]);
    expect(sizes.reduce((total, size) => total + size, 0))
      .toBeLessThanOrEqual(150 * 1024);

    for (const fontPath of [regularPath, mediumPath]) {
      expect((await readFile(fontPath)).subarray(0, 4).toString("ascii"))
        .toBe("wOF2");
    }
  });

  test("provides normal static metadata for weights 400 and 500", async () => {
    const fonts = await Promise.all([regularPath, mediumPath].map(loadFont));

    expect(fonts.map((font) => font.type)).toEqual(["WOFF2", "WOFF2"]);
    expect(fonts.map((font) => font["OS/2"].usWeightClass)).toEqual([400, 500]);
    expect(fonts.map((font) => font.italicAngle)).toEqual([0, 0]);
    expect(fonts.map((font) => font.variationAxes)).toEqual([{}, {}]);
  });

  test("uses Astro local font delivery with swap and explicit weights", async () => {
    const config = await readProjectFile("astro.config.mjs");

    expect(config).toContain("fontProviders.local()");
    expect(config).toContain('cssVariable: "--font-ibm-plex-mono"');
    expect(config).toContain("weights: [400, 500]");
    expect(config).toContain('styles: ["normal"]');
    expect(config).toContain('formats: ["woff2"]');
    expect(config.match(/display: "swap"/g)).toHaveLength(2);
    expect(config).not.toMatch(
      /fonts\.(googleapis|gstatic)\.com|use\.typekit\.net|cdn\.jsdelivr\.net/,
    );
  });

  test("preloads only the above-the-fold medium face", async () => {
    const layout = await readProjectFile("src/layouts/Layout.astro");

    expect(layout).toContain('import { Font } from "astro:assets"');
    expect(layout).toContain('cssVariable="--font-ibm-plex-mono"');
    expect(layout).toContain('preload={[{ weight: 500, style: "normal" }]}');
  });
});

describe("terminal typography roles and effects", () => {
  test("defines explicit terminal and reading stacks without synthesis", async () => {
    const css = await readProjectFile("src/styles/global.css");

    expect(css).toContain("--font-terminal: var(--font-ibm-plex-mono)");
    expect(css).toContain('--font-reading: "PingFang TC", "Noto Sans TC"');
    expect(css).not.toContain("--mono:");
    expect(css).toContain("font-synthesis: none");
  });

  test("assigns long-form copy to the reading stack", async () => {
    const css = await readProjectFile("src/styles/global.css");

    for (const selector of [
      ".hero-description",
      ".about-copy",
      ".viewer-description",
    ]) {
      const start = css.indexOf(`${selector} {`);
      expect(start).toBeGreaterThan(-1);
      expect(css.slice(start, css.indexOf("}", start))).toContain(
        "font-family: var(--font-reading)",
      );
    }
  });

  test("keeps effects progressive, text-scoped, and motion-safe", async () => {
    const css = await readProjectFile("src/styles/global.css");

    expect(css).toContain("@supports ((background-clip: text)");
    expect(css).toContain("@supports (\n  (mask-image:");
    expect(css).toContain(".hero-copy h1 span {");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none !important");

    const photoRuleStart = css.indexOf(".photo-frame img,");
    const photoRule = css.slice(
      photoRuleStart,
      css.indexOf("}", photoRuleStart) + 1,
    );
    expect(photoRule).toContain("opacity: 1");
    expect(photoRule).toContain("filter: none");
    expect(photoRule).toContain("mix-blend-mode: normal");
    expect(photoRule).not.toMatch(
      /mask-image|background-clip|text-shadow|backdrop-filter/,
    );
  });
});
